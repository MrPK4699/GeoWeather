// Picks the animated background "scene" from the OpenWeather condition id and day/night.
// Condition ids: https://openweathermap.org/weather-conditions
//   2xx thunderstorm · 3xx drizzle · 5xx rain · 6xx snow · 7xx mist/fog/haze · 800 clear · 80x clouds

export const SCENES = ['clear-day', 'clear-night', 'clouds-day', 'clouds-night', 'rain', 'thunder', 'snow', 'mist'];

export function getScene(id, isNight) {
  if (id >= 200 && id < 300) return 'thunder';
  if (id >= 300 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'mist';
  if (id === 800) return isNight ? 'clear-night' : 'clear-day';
  return isNight ? 'clouds-night' : 'clouds-day';
}

/** OpenWeather icon codes end in 'n' at night. */
export const isNightIcon = (icon = '') => icon.endsWith('n');
