// All API values arrive metric (°C, m/s, metres). These convert for display.

export const UNITS = {
  metric: { temp: '°C', wind: 'km/h', distance: 'km', rain: 'mm' },
  imperial: { temp: '°F', wind: 'mph', distance: 'mi', rain: 'in' },
};

/** Rainfall: mm -> mm (1 decimal) or inches (2 decimals). */
export const rainAmount = (mm, unit) =>
  unit === 'imperial' ? Math.round((mm / 25.4) * 100) / 100 : Math.round(mm * 10) / 10;

/** Temperature DIFFERENCE (no +32 offset for °F). */
export const tempDelta = (celsiusDiff, unit) => Math.round(unit === 'imperial' ? (celsiusDiff * 9) / 5 : celsiusDiff);

export const temp = (celsius, unit) => Math.round(unit === 'imperial' ? (celsius * 9) / 5 + 32 : celsius);

export const formatTemp = (celsius, unit) => `${temp(celsius, unit)}°`;

export const windSpeed = (ms, unit) => Math.round(unit === 'imperial' ? ms * 2.23694 : ms * 3.6);

export const distance = (metres, unit) => {
  const value = unit === 'imperial' ? metres / 1609.34 : metres / 1000;
  return value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
};

const DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

/** 225 -> 'SW' */
export const compass = (deg = 0) => DIRECTIONS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
