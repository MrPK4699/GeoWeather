import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from './App';
import { getDailyRange } from './services/openMeteo';
import * as api from './services/weatherApi';

// Never call the real API (or use the real key) in tests
vi.mock('./services/weatherApi', async (importOriginal) => {
  const real = await importOriginal();
  return {
    ...real,
    getWeather: vi.fn(),
    getForecast: vi.fn(),
    searchCities: vi.fn(),
    reverseGeocode: vi.fn(),
  };
});
vi.mock('./services/openMeteo', () => ({ getDailyRange: vi.fn() }));
// Leaflet needs a real browser; the map isn't what these tests check
vi.mock('./components/WeatherMap', () => ({
  default: ({ place }) => <div data-testid="map">{`${place.lat},${place.lon}`}</div>,
}));

// Last week: highs 30, lows 24, 2 mm/day. Next week: highs 33, lows 25, 0.5 mm/day.
const week = (startDay, max, min, rain) =>
  Array.from({ length: 7 }, (_, i) => ({
    date: `2026-11-${String(startDay + i).padStart(2, '0')}`,
    max,
    min,
    rain,
    pop: 0.5,
    code: 61,
  }));
const dailyRange = () => ({
  past: week(13, 30, 24, 2),
  today: { date: '2026-11-20', max: 32, min: 25, rain: 0, pop: 0, code: 1 },
  next: week(21, 33, 25, 0.5),
});

const TZ = 7 * 3600; // Ho Chi Minh City, UTC+7
const at = (iso) => Date.parse(iso) / 1000;

const weather = (temp, { id = 800, icon = '01d', description = 'clear sky' } = {}) => ({
  dt: at('2026-11-20T05:00:00Z'),
  timezone: TZ,
  weather: [{ id, icon, description }],
  main: { temp, feels_like: temp + 3, humidity: 70, pressure: 1010 },
  wind: { speed: 5, deg: 90 },
  visibility: 10000,
  clouds: { all: 20 },
  sys: { sunrise: at('2026-11-19T22:45:00Z'), sunset: at('2026-11-20T10:30:00Z') },
});

// 3-hour slots from 06:00Z on the 20th (local 13:00 on Friday 20th) by default
const forecast = (startIso = '2026-11-20T06:00:00Z') => ({
  city: { timezone: TZ },
  list: Array.from({ length: 40 }, (_, i) => {
    const dt = at(startIso) + i * 3 * 3600;
    const t = 25 + Math.round(4 * Math.sin(i / 2)) + Math.floor(i / 8);
    return {
      dt,
      main: { temp: t, temp_min: t, temp_max: t },
      pop: i % 5 === 0 ? 0.6 : 0,
      weather: [{ id: 500, icon: i % 8 < 4 ? '10d' : '10n', description: 'light rain' }],
    };
  }),
});

const renderApp = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  // Pin "now" to Fri 20 Nov 2026, 12:00 in Ho Chi Minh City (only Date is faked; timers stay real)
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-20T05:00:00Z'));
  vi.clearAllMocks();
  api.getWeather.mockResolvedValue(weather(28.47));
  api.getForecast.mockResolvedValue(forecast());
  getDailyRange.mockResolvedValue(dailyRange());
});
afterEach(() => vi.useRealTimers());

test('shows current weather, details, hourly and 5-day forecast for the default city', async () => {
  renderApp();
  expect(screen.getByRole('status', { name: /loading weather/i })).toBeInTheDocument();

  expect(await screen.findByTestId('current-temp')).toHaveTextContent('28°C');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ho Chi Minh City, VN');
  expect(screen.getByText(/feels like 31°/i)).toBeInTheDocument();

  // Both requests use coordinates and run once each
  expect(api.getWeather).toHaveBeenCalledTimes(1);
  expect(api.getWeather.mock.calls[0][0]).toMatchObject({ lat: 10.7769, lon: 106.7009 });
  expect(api.getForecast).toHaveBeenCalledTimes(1);

  // Sunrise/sunset in city-local time (UTC+7)
  expect(screen.getByText('↑ 05:45')).toBeInTheDocument();
  expect(screen.getByText('↓ 17:30')).toBeInTheDocument();
  expect(screen.getByText('18')).toBeInTheDocument(); // 5 m/s = 18 km/h

  const hourly = screen.getByRole('region', { name: /next 24 hours/i });
  expect(within(hourly).getAllByRole('listitem')).toHaveLength(8);
  expect(within(hourly).getByText('13:00')).toBeInTheDocument(); // first slot, local

  const daily = screen.getByRole('region', { name: /5-day forecast/i });
  const dayButtons = within(daily).getAllByRole('button');
  expect(dayButtons).toHaveLength(5);
  expect(dayButtons[0]).toHaveTextContent('Today');
  expect(dayButtons[0]).toHaveAttribute('aria-pressed', 'true');

  expect(await screen.findByTestId('map')).toHaveTextContent('10.7769,106.7009'); // lazy-loaded
  expect(document.title).toBe('Ho Chi Minh City, VN · 28°C · GeoWeather');
});

test('late at night the forecast starts tomorrow, so no row is wrongly labelled "Today"', async () => {
  // 23:39 on Friday locally; first forecast slot is 01:00 on Saturday
  vi.setSystemTime(new Date('2026-11-20T16:39:00Z'));
  api.getForecast.mockResolvedValue(forecast('2026-11-20T18:00:00Z'));
  renderApp();
  const daily = await screen.findByRole('region', { name: /5-day forecast/i });
  const rows = within(daily).getAllByRole('button');
  expect(rows[0]).toHaveTextContent('Saturday');
  expect(within(daily).queryByText('Today')).not.toBeInTheDocument();
  // No "today" data left, so the card doesn't show a misleading H/L
  expect(screen.getByText(/feels like/i)).not.toHaveTextContent(/H \d/);
  expect(screen.getByRole('tab', { name: 'Saturday' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByText(/friday 20 november · 23:39/i)).toBeInTheDocument();
});

test('clicking a day updates the chart', async () => {
  const user = userEvent.setup();
  renderApp();
  const daily = await screen.findByRole('region', { name: /5-day forecast/i });
  expect(screen.getByRole('tab', { name: 'Next 24 h' })).toHaveAttribute('aria-selected', 'true');

  const second = within(daily).getAllByRole('button')[1];
  await user.click(second);
  expect(second).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('tab', { name: 'Saturday' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('img', { name: /saturday: temperature and chance of rain/i })).toBeInTheDocument();
});

test('late evening: "Today" chart shows the next 24 h, and today uses the full-day high/low', async () => {
  // 22:58 local; the 3-hour forecast has only ONE slot left today (22:00 local)
  vi.setSystemTime(new Date('2026-11-20T15:58:00Z'));
  api.getForecast.mockResolvedValue(forecast('2026-11-20T15:00:00Z'));
  renderApp();

  expect(await screen.findByRole('tab', { name: 'Next 24 h' })).toHaveAttribute('aria-selected', 'true');
  const chart = screen.getByRole('img', { name: /next 24 h: temperature and chance of rain/i });
  expect(chart.getAttribute('aria-label').split(';')).toHaveLength(8); // 8 points, not 1
  expect(chart.querySelectorAll('circle')).toHaveLength(8);

  // Full day from Open-Meteo (25-32) instead of the single remaining slot (25)
  const todayRow = within(screen.getByRole('region', { name: /5-day forecast/i })).getAllByRole('button')[0];
  expect(todayRow).toHaveTextContent(/Today.*25°.*32°/);
  expect(screen.getByText(/feels like/i)).toHaveTextContent('H 32° · L 25°');
});

test('7-day tabs: each week is compared with the other, data fetched once', async () => {
  const user = userEvent.setup();
  renderApp();
  await screen.findByRole('tab', { name: 'Next 24 h' });
  // Loaded once on page load (for today's full-day high/low) and reused by the tabs
  await waitFor(() => expect(getDailyRange).toHaveBeenCalledTimes(1));

  await user.click(screen.getByRole('tab', { name: 'Last 7 days' }));
  expect(getDailyRange).toHaveBeenCalledWith(expect.objectContaining({ lat: 10.7769, lon: 106.7009 }), expect.anything());
  const past = await screen.findByTestId('comparison');
  expect(past).toHaveTextContent('Avg high30°3° cooler than next 7 days');
  expect(past).toHaveTextContent('Avg low24°1° cooler than next 7 days');
  expect(past).toHaveTextContent('Total rain14 mm10.5 mm more than next 7 days');
  expect(past).toHaveTextContent('7 rainy days');
  expect(screen.getByRole('img', { name: /last 7 days: daily high, low and rainfall/i })).toHaveAccessibleName(
    /fri 13: high 30°C, low 24°C, rain 2 mm/i
  );

  // Keyboard: right arrow moves to "Next 7 days" (same cached data, no new request)
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Next 7 days' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByTestId('comparison')).toHaveTextContent('Avg high33°3° warmer than last 7 days');
  expect(screen.getByTestId('comparison')).toHaveTextContent('0 rainy days'); // 0.5 mm/day is below 1 mm
  expect(getDailyRange).toHaveBeenCalledTimes(1);

  // °F: differences convert without the +32 offset (3 °C difference = 5 °F)
  await user.click(screen.getByRole('button', { name: '°F' }));
  expect(screen.getByTestId('comparison')).toHaveTextContent('Avg high91°5° warmer than last 7 days');
  expect(screen.getByTestId('comparison')).toHaveTextContent('Total rain0.14 in');
});

test('7-day data failure shows an inline error with retry, rest of the page stays', async () => {
  getDailyRange.mockRejectedValue(new api.ApiError(500, 'down')); // keeps failing until "Try again"
  const user = userEvent.setup();
  renderApp();
  await user.click(await screen.findByRole('tab', { name: 'Next 7 days' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't load 7-day data/i);
  expect(screen.getByTestId('current-temp')).toBeInTheDocument();

  getDailyRange.mockResolvedValue(dailyRange());
  await user.click(screen.getByRole('button', { name: /try again/i }));
  expect(await screen.findByTestId('comparison')).toBeInTheDocument();
});

test('°F toggle converts everything and is remembered', async () => {
  const user = userEvent.setup();
  renderApp();
  await screen.findByTestId('current-temp');
  await user.click(screen.getByRole('button', { name: '°F' }));
  expect(screen.getByTestId('current-temp')).toHaveTextContent('83°F');
  expect(screen.getByText('11')).toBeInTheDocument(); // 5 m/s = 11 mph
  expect(JSON.parse(localStorage.getItem('gw-unit'))).toBe('imperial');
});

test('searching a city loads it, and it appears under Recent', async () => {
  const user = userEvent.setup();
  api.searchCities.mockResolvedValue([{ name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 }]);
  renderApp();
  await screen.findByTestId('current-temp');

  api.getWeather.mockResolvedValue(weather(9, { id: 803, icon: '04n', description: 'broken clouds' }));
  const input = screen.getByRole('combobox', { name: /search for a city/i });
  await user.type(input, 'Par');
  const option = await screen.findByRole('option', { name: 'Paris, FR' });
  await waitFor(() => expect(api.searchCities).toHaveBeenCalledWith('Par', expect.anything()));
  await user.click(option);

  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Paris, FR'));
  expect(await screen.findByText('9°')).toBeInTheDocument();
  expect(document.querySelector('[data-scene]')).toHaveAttribute('data-scene', 'clouds-night');
  expect(JSON.parse(localStorage.getItem('gw-place'))).toMatchObject({ name: 'Paris' });

  // Recent list shows Paris first when the box is opened again
  await user.click(input);
  const listbox = screen.getByRole('listbox');
  expect(within(listbox).getByText('Recent')).toBeInTheDocument();
  expect(within(listbox).getAllByRole('option')[0]).toHaveTextContent('Paris, FR');
});

test('keyboard: arrows + Enter pick a popular city', async () => {
  const user = userEvent.setup();
  renderApp();
  await screen.findByTestId('current-temp');
  const input = screen.getByRole('combobox');
  await user.click(input);
  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}'); // HCMC (0) -> Singapore (1) -> Kuala Lumpur (2)
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kuala Lumpur, MY'));
});

test('API error shows a friendly message and retry works', async () => {
  const user = userEvent.setup();
  api.getWeather.mockRejectedValueOnce(new api.ApiError(401, 'bad key'));
  renderApp();
  expect(await screen.findByRole('alert')).toHaveTextContent(/api key is missing or invalid/i);

  await user.click(screen.getByRole('button', { name: /try again/i }));
  expect(await screen.findByTestId('current-temp')).toHaveTextContent('28°C');
});

test('"Use my location" loads the weather for the GPS position', async () => {
  const user = userEvent.setup();
  navigator.geolocation = {
    getCurrentPosition: (ok) => ok({ coords: { latitude: 19.076, longitude: 72.8777 } }),
  };
  api.reverseGeocode.mockResolvedValue({ name: 'Mumbai', state: 'Maharashtra', country: 'IN', lat: 19.076, lon: 72.8777 });
  renderApp();
  await screen.findByTestId('current-temp');
  await user.click(screen.getByRole('button', { name: /use my location/i }));
  await waitFor(() =>
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mumbai, Maharashtra, IN')
  );
  expect(api.getWeather).toHaveBeenLastCalledWith(expect.objectContaining({ lat: 19.076 }), expect.anything());
});

test('denied location shows a notice instead of a fake place', async () => {
  const user = userEvent.setup();
  navigator.geolocation = { getCurrentPosition: (_ok, fail) => fail({ code: 1 }) };
  renderApp();
  await screen.findByTestId('current-temp');
  await user.click(screen.getByRole('button', { name: /use my location/i }));
  expect(await screen.findByText(/location permission was denied/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ho Chi Minh City, VN');
});
