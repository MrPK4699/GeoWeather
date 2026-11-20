// Quick picks shown in the search box before the user types (the original 5 cities + two more).
export const POPULAR_CITIES = [
  { name: 'Ho Chi Minh City', country: 'VN', lat: 10.7769, lon: 106.7009 },
  { name: 'Singapore', country: 'SG', lat: 1.2897, lon: 103.8501 },
  { name: 'Kuala Lumpur', country: 'MY', lat: 3.139, lon: 101.6869 },
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: 'Athens', country: 'GR', lat: 37.9838, lon: 23.7275 },
  { name: 'New Delhi', country: 'IN', lat: 28.6139, lon: 77.209 },
  { name: 'London', country: 'GB', lat: 51.5072, lon: -0.1276 },
];

export const DEFAULT_LOCATION = POPULAR_CITIES[0];

/** "Ho Chi Minh City, VN" / "Springfield, Illinois, US" */
export const placeLabel = (p) => [p.name, p.state, p.country].filter(Boolean).join(', ');

export const samePlace = (a, b) =>
  Math.abs(a.lat - b.lat) < 0.01 && Math.abs(a.lon - b.lon) < 0.01;
