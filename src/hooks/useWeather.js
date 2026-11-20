import { useQueries, useQuery } from '@tanstack/react-query';
import { getDailyRange } from '../services/openMeteo';
import { getForecast, getWeather, searchCities } from '../services/weatherApi';
import { useDebounce } from './useDebounce';

const TEN_MINUTES = 10 * 60 * 1000;
// ~100 m precision is plenty for weather and lets nearby lookups share a cache entry
const coordKey = ({ lat, lon }) => [Number(lat).toFixed(3), Number(lon).toFixed(3)];

/**
 * Current weather + forecast for a location, fetched in parallel.
 * TanStack Query caches by coordinates (switching back to a city is instant),
 * and cancels the previous request when the location changes, so an old reply can't
 * overwrite a new one.
 */
export function useWeather(location) {
  const key = coordKey(location);
  const [current, forecast] = useQueries({
    queries: [
      {
        queryKey: ['weather', ...key],
        queryFn: ({ signal }) => getWeather(location, signal),
        staleTime: TEN_MINUTES,
      },
      {
        queryKey: ['forecast', ...key],
        queryFn: ({ signal }) => getForecast(location, signal),
        staleTime: TEN_MINUTES,
      },
    ],
  });

  return {
    current: current.data,
    forecast: forecast.data,
    isLoading: current.isPending || forecast.isPending,
    isFetching: current.isFetching || forecast.isFetching,
    error: current.error || forecast.error,
    refetch: () => Promise.all([current.refetch(), forecast.refetch()]),
  };
}

/** Last 7 days + next 7 days (Open-Meteo). Only fetched when `enabled` (a 7-day tab is open). */
export function useDailyRange(location, enabled) {
  return useQuery({
    queryKey: ['daily-range', ...coordKey(location)],
    queryFn: ({ signal }) => getDailyRange(location, signal),
    enabled,
    staleTime: 30 * 60 * 1000,
  });
}

/** City suggestions while typing (debounced, 2+ characters). */
export function useCitySearch(query) {
  const q = useDebounce(query.trim(), 300);
  return useQuery({
    queryKey: ['cities', q.toLowerCase()],
    queryFn: ({ signal }) => searchCities(q, signal),
    enabled: q.length >= 2,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
