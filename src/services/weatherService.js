import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = process.env.REACT_APP_BASE_URL;

// units=metric: the API returns °C directly, so no Kelvin conversion is needed anywhere.
const client = axios.create({
    baseURL: BASE_URL,
    params: { appid: API_KEY, units: 'metric' },
});

export const getCurrentWeather = (city, { signal } = {}) =>
    client.get('/weather', { params: { q: city }, signal });

// The free API returns 3-hour steps: 8 per day, 40 max (5 days).
export const getWeatherForecast = (city, { days = 5, signal } = {}) =>
    client.get('/forecast', { params: { q: city, cnt: days * 8 }, signal });

/** True when a request was cancelled on purpose (e.g. the user switched city). */
export const isRequestCancelled = (error) => axios.isCancel(error);

/** A readable message for the UI. */
export const getErrorMessage = (error) => {
    const status = error?.response?.status;
    if (status === 404) return 'City not found.';
    if (status === 401) return 'The weather API key is missing or invalid.';
    if (status === 429) return 'Too many requests. Please wait a minute and try again.';
    if (!error?.response) return 'Network error. Check your internet connection.';
    return 'Could not load the weather. Please try again.';
};
