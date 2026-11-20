import { expect, test } from 'vitest';
import { compass, distance, formatTemp, rainAmount, temp, tempDelta, windSpeed } from './units';
import { getScene, isNightIcon } from './scene';
import { summarizeRange, wmoInfo } from './wmo';

test('rain amounts and temperature differences', () => {
  expect(rainAmount(4.37, 'metric')).toBe(4.4);
  expect(rainAmount(25.4, 'imperial')).toBe(1);
  expect(tempDelta(3, 'metric')).toBe(3);
  expect(tempDelta(3, 'imperial')).toBe(5); // a difference: no +32
  expect(tempDelta(-2, 'imperial')).toBe(-4);
});

test('WMO codes map to icons, and a week is summarised', () => {
  expect(wmoInfo(0)).toEqual({ icon: '01d', description: 'Clear sky' });
  expect(wmoInfo(63).icon).toBe('10d');
  expect(wmoInfo(95).icon).toBe('11d');
  expect(wmoInfo(12345).icon).toBe('03d'); // unknown code -> generic cloud
  const s = summarizeRange([
    { max: 30, min: 20, rain: 0 },
    { max: 34, min: 24, rain: 5.5 },
  ]);
  expect(s).toEqual({ avgHigh: 32, avgLow: 22, rainTotal: 5.5, rainyDays: 1 });
  expect(summarizeRange([]).rainTotal).toBe(0);
});

test('temperature conversion and rounding', () => {
  expect(temp(28.47, 'metric')).toBe(28);
  expect(temp(0, 'imperial')).toBe(32);
  expect(temp(100, 'imperial')).toBe(212);
  expect(formatTemp(-3.6, 'metric')).toBe('-4°');
});

test('wind, distance and compass', () => {
  expect(windSpeed(10, 'metric')).toBe(36); // m/s -> km/h
  expect(windSpeed(10, 'imperial')).toBe(22); // m/s -> mph
  expect(distance(10000, 'metric')).toBe(10);
  expect(distance(2500, 'metric')).toBe(2.5);
  expect(distance(10000, 'imperial')).toBe(6.2);
  expect(compass(0)).toBe('N');
  expect(compass(225)).toBe('SW');
  expect(compass(359)).toBe('N');
  expect(compass(-90)).toBe('W');
});

test('background scene follows the condition and day/night', () => {
  expect(getScene(800, false)).toBe('clear-day');
  expect(getScene(800, true)).toBe('clear-night');
  expect(getScene(803, false)).toBe('clouds-day');
  expect(getScene(803, true)).toBe('clouds-night');
  expect(getScene(211, false)).toBe('thunder');
  expect(getScene(301, false)).toBe('rain');
  expect(getScene(502, true)).toBe('rain');
  expect(getScene(601, false)).toBe('snow');
  expect(getScene(741, false)).toBe('mist');
  expect(isNightIcon('01n')).toBe(true);
  expect(isNightIcon('01d')).toBe(false);
});
