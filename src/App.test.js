import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { getCurrentWeather, getWeatherForecast } from './services/weatherService';

// Never call the real API (or use the real key) in tests.
jest.mock('./services/weatherService', () => ({
  getCurrentWeather: jest.fn(),
  getWeatherForecast: jest.fn(),
  isRequestCancelled: (err) => err && err.name === 'CanceledError',
  getErrorMessage: (err) => (err.response && err.response.status === 404 ? 'City not found.' : 'Could not load the weather.'),
}));
// Leaflet and Chart.js need a real browser canvas/DOM; they are not what these tests check.
jest.mock('./components/MapComponent', () => (props) => <div data-testid="city-map">{`${props.lat},${props.lon}`}</div>);
jest.mock('./components/GeoLocationMap', () => () => <div data-testid="geo-map" />);
jest.mock('react-chartjs-2', () => ({ Line: () => <div data-testid="chart" /> }));

const TOKYO = 9 * 3600;
const at = (iso) => Date.parse(iso) / 1000;

const currentFor = (city, temp) => ({
  data: { main: { temp }, weather: [{ description: `${city} sky` }], coord: { lat: 1.5, lon: 2.5 } },
});
const forecastFor = (temp) => ({
  data: {
    city: { timezone: TOKYO },
    list: ['2026-11-19T09:00:00Z', '2026-11-19T12:00:00Z', '2026-11-19T15:00:00Z'].map((iso) => ({
      dt: at(iso),
      main: { temp },
      weather: [{ icon: '01d', description: 'clear sky' }],
    })),
  },
});

// A request we can resolve/reject by hand, that also rejects when its signal aborts (like axios).
const controllable = () => {
  let resolve;
  let reject;
  let signal;
  const fn = (city, opts) => {
    signal = opts.signal;
    return new Promise((res, rej) => {
      resolve = res;
      reject = rej;
      signal.addEventListener('abort', () => rej(Object.assign(new Error('canceled'), { name: 'CanceledError' })));
    });
  };
  return { fn, resolve: (v) => resolve(v), reject: (e) => reject(e), signal: () => signal };
};

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

test('loads both requests in parallel, shows rounded °C and city-local times, no geocoding call', async () => {
  getCurrentWeather.mockResolvedValue(currentFor('Ho Chi Minh', 28.47));
  getWeatherForecast.mockResolvedValue(forecastFor(25.4));

  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading weather for Ho Chi Minh');

  expect(await screen.findByText('Temperature: 28°C')).toBeInTheDocument();
  expect(getCurrentWeather).toHaveBeenCalledTimes(1);
  expect(getWeatherForecast).toHaveBeenCalledTimes(1);
  expect(global.fetch).not.toHaveBeenCalled(); // Nominatim request removed

  // 09:00Z and 12:00Z are 18:00 and 21:00 on the 19th in Tokyo; 15:00Z is the 20th
  expect(screen.getByText('18:00')).toBeInTheDocument();
  expect(screen.getByText('21:00')).toBeInTheDocument();
  expect(screen.queryByText('00:00')).not.toBeInTheDocument();
  expect(screen.getAllByText('Temperature: 25°C')).toHaveLength(2); // the 2 slots on the 19th, rounded

  const dateInput = screen.getByLabelText('Select Date');
  expect(dateInput).toHaveValue('2026-11-19');
  expect(dateInput).toHaveAttribute('min', '2026-11-19');
  expect(dateInput).toHaveAttribute('max', '2026-11-20');
  expect(screen.getByLabelText('Select City:')).toHaveValue('Ho Chi Minh');
  expect(screen.getByTestId('city-map')).toHaveTextContent('1.5,2.5');
});

test('shows an error with a working "Try again" button', async () => {
  getCurrentWeather.mockRejectedValueOnce({ response: { status: 404 } });
  getWeatherForecast.mockResolvedValue(forecastFor(19));

  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent('City not found.');

  getCurrentWeather.mockResolvedValue(currentFor('Ho Chi Minh', 20));
  userEvent.click(screen.getByRole('button', { name: /try again/i }));
  expect(await screen.findByText('Temperature: 20°C')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('switching city cancels the old request, so its late reply is never shown', async () => {
  const first = controllable();
  getCurrentWeather.mockImplementationOnce(first.fn);
  getWeatherForecast.mockImplementationOnce(() => new Promise(() => {}));

  render(<App />);
  // The second city answers normally
  getCurrentWeather.mockResolvedValue(currentFor('Tokyo', 10));
  getWeatherForecast.mockResolvedValue(forecastFor(9));
  userEvent.selectOptions(screen.getByLabelText('Select City:'), 'Tokyo');

  expect(first.signal().aborted).toBe(true);
  expect(await screen.findByText('Temperature: 10°C')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Tokyo' })).toBeInTheDocument();

  // Even if the old request "finished" now, nothing changes
  await act(async () => first.resolve(currentFor('Ho Chi Minh', 35)));
  expect(screen.queryByText('Temperature: 35°C')).not.toBeInTheDocument();
  expect(localStorage.getItem('selectedCity')).toBe('Tokyo');
});

test('remembers the chosen city', async () => {
  localStorage.setItem('selectedCity', 'Athens');
  getCurrentWeather.mockResolvedValue(currentFor('Athens', 15));
  getWeatherForecast.mockResolvedValue(forecastFor(15));
  render(<App />);
  await waitFor(() => expect(getCurrentWeather).toHaveBeenCalledWith('Athens', expect.anything()));
  expect(screen.getByLabelText('Select City:')).toHaveValue('Athens');
});
