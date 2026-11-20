// Open-Meteo (https://open-meteo.com): free, no API key. Used for the 7-day comparison
// because the free OpenWeather plan has no history and only 5 days ahead.
// Licence: CC BY 4.0, so attribution is shown in the app footer.
import { ApiError } from './weatherApi';

const API_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Daily summary for the last 7 days, today and the next 7 days, in the place's local time.
 * Returns { past: Day[7], today: Day, next: Day[7] } where
 * Day = { date: 'YYYY-MM-DD', max, min (°C), rain (mm), pop (0-1), code (WMO weather code) }.
 */
export async function getDailyRange({ lat, lon }, signal) {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
    past_days: 7,
    forecast_days: 8, // today + 7
    timezone: 'auto',
  }).toString();

  const res = await fetch(url, { signal });
  if (!res.ok) throw new ApiError(res.status, `Open-Meteo request failed with status ${res.status}`);
  const { daily: d } = await res.json();

  const days = d.time.map((date, i) => ({
    date,
    max: d.temperature_2m_max[i],
    min: d.temperature_2m_min[i],
    rain: d.precipitation_sum[i] ?? 0,
    pop: (d.precipitation_probability_max[i] ?? 0) / 100,
    code: d.weather_code[i],
  }));
  return { past: days.slice(0, 7), today: days[7], next: days.slice(8, 15) };
}
