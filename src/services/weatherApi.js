// OpenWeather API calls (current weather, 5-day forecast, city search).
// NOTE: a key used in browser code is visible to anyone who opens DevTools.
// Before deploying publicly, put these calls behind a small server-side proxy.

const API_ROOT = 'https://api.openweathermap.org';
// New name first; falls back to the old CRA name so the existing .env keeps working.
const API_KEY = import.meta.env.VITE_OWM_API_KEY || import.meta.env.REACT_APP_API_KEY;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, params, signal) {
  if (!API_KEY) throw new ApiError(401, 'Missing API key');
  const url = new URL(path, API_ROOT);
  Object.entries({ ...params, appid: API_KEY }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { signal });
  if (!res.ok) throw new ApiError(res.status, `Request failed with status ${res.status}`);
  return res.json();
}

/** Current conditions. Coordinates are more precise than city names (no "which Paris?"). */
export const getWeather = ({ lat, lon }, signal) =>
  request('/data/2.5/weather', { lat, lon, units: 'metric' }, signal);

/** 5 days in 3-hour steps (40 entries). */
export const getForecast = ({ lat, lon }, signal) =>
  request('/data/2.5/forecast', { lat, lon, units: 'metric' }, signal);

/** City autocomplete: up to 5 matches with coordinates. */
export const searchCities = (query, signal) =>
  request('/geo/1.0/direct', { q: query, limit: 5 }, signal).then((list) =>
    list.map((c) => ({ name: c.name, state: c.state, country: c.country, lat: c.lat, lon: c.lon }))
  );

/** Place name for the user's GPS position. */
export const reverseGeocode = ({ lat, lon }, signal) =>
  request('/geo/1.0/reverse', { lat, lon, limit: 1 }, signal).then(([c]) =>
    c ? { name: c.name, state: c.state, country: c.country, lat, lon } : { name: 'My location', lat, lon }
  );

/** Rain radar map tiles. */
export const precipitationTileUrl = () =>
  `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`;

export const getErrorMessage = (error) => {
  const status = error?.status;
  if (status === 404) return "We couldn't find weather for this place.";
  if (status === 401) return 'The weather API key is missing or invalid. Check your .env file.';
  if (status === 429) return 'Too many requests right now. Please wait a minute and try again.';
  if (error instanceof TypeError) return 'Network error. Check your internet connection.';
  return 'Something went wrong while loading the weather.';
};
