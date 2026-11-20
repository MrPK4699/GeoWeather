import { formatDay, groupByLocalDate, localDate, localTime } from './forecast';

const TOKYO = 9 * 3600; // UTC+9
const at = (iso) => Date.parse(iso) / 1000;

test('localDate / localTime use the city time zone, not UTC or the viewer', () => {
  const dt = at('2026-11-19T15:00:00Z'); // 00:00 on the 20th in Tokyo
  expect(localDate(dt, TOKYO)).toBe('2026-11-20');
  expect(localTime(dt, TOKYO)).toBe('00:00');
  expect(localDate(dt, 0)).toBe('2026-11-19');
  expect(localTime(dt, -5 * 3600)).toBe('10:00'); // New York-ish
});

test('groupByLocalDate splits 3-hour items into city-local days, in order', () => {
  const list = ['2026-11-19T09:00:00Z', '2026-11-19T12:00:00Z', '2026-11-19T15:00:00Z', '2026-11-19T18:00:00Z'].map(
    (iso) => ({ dt: at(iso) })
  );
  const days = groupByLocalDate(list, TOKYO);
  expect(Object.keys(days)).toEqual(['2026-11-19', '2026-11-20']);
  expect(days['2026-11-19']).toHaveLength(2); // 18:00, 21:00 local
  expect(days['2026-11-20']).toHaveLength(2); // 00:00, 03:00 local
  expect(groupByLocalDate(undefined, 0)).toEqual({});
});

test('formatDay', () => {
  expect(formatDay('2026-11-20')).toBe('Fri 20 Nov');
});
