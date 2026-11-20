// WMO weather codes (used by Open-Meteo) -> OpenWeather-style icon code + short description,
// so the same WeatherIcon component works for both data sources.
// Codes: https://open-meteo.com/en/docs (WMO Weather interpretation codes)

const TABLE = [
  [[0], '01d', 'Clear sky'],
  [[1], '02d', 'Mainly clear'],
  [[2], '03d', 'Partly cloudy'],
  [[3], '04d', 'Overcast'],
  [[45, 48], '50d', 'Fog'],
  [[51, 53, 55, 56, 57], '09d', 'Drizzle'],
  [[61, 63, 65, 66, 67], '10d', 'Rain'],
  [[80, 81, 82], '09d', 'Rain showers'],
  [[71, 73, 75, 77, 85, 86], '13d', 'Snow'],
  [[95, 96, 99], '11d', 'Thunderstorm'],
];

export function wmoInfo(code) {
  const row = TABLE.find(([codes]) => codes.includes(code));
  return row ? { icon: row[1], description: row[2] } : { icon: '03d', description: 'Cloudy' };
}

/** Averages and totals for a list of days: { avgHigh, avgLow, rainTotal (mm), rainyDays (≥1 mm) }. */
export function summarizeRange(days = []) {
  if (!days.length) return { avgHigh: 0, avgLow: 0, rainTotal: 0, rainyDays: 0 };
  const avg = (key) => days.reduce((s, d) => s + d[key], 0) / days.length;
  return {
    avgHigh: avg('max'),
    avgLow: avg('min'),
    rainTotal: days.reduce((s, d) => s + (d.rain || 0), 0),
    rainyDays: days.filter((d) => d.rain >= 1).length,
  };
}
