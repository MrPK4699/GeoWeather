import { formatDay, formatWeekday, groupByLocalDate, localDate, localTime, summarizeDays } from './forecast';

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

test('formatDay / formatWeekday', () => {
  expect(formatDay('2026-11-20')).toBe('Fri 20 Nov');
  expect(formatWeekday('2026-11-20')).toBe('Friday');
});

test('summarizeDays: min/max, max rain chance, and the midday icon (as a day icon)', () => {
  const slot = (iso, t, pop, icon, id = 500) => ({
    dt: at(iso),
    main: { temp: t, temp_min: t, temp_max: t },
    pop,
    weather: [{ icon, id, description: `d${t}` }],
  });
  // UTC+0 city: 00:00, 12:00, 21:00 on the 20th; 03:00 on the 21st
  const list = [
    slot('2026-11-20T00:00:00Z', 18, 0, '01n', 800),
    slot('2026-11-20T12:00:00Z', 27, 0.4, '10d', 500),
    slot('2026-11-20T21:00:00Z', 21, 0.9, '10n', 501),
    slot('2026-11-21T03:00:00Z', 16, 0, '04n', 804),
  ];
  const [d1, d2] = summarizeDays(list, 0);
  expect(d1).toMatchObject({ date: '2026-11-20', min: 18, max: 27, pop: 0.9, icon: '10d', id: 500, description: 'd27' });
  expect(d1.items).toHaveLength(3);
  // Only a night slot that day -> still shown with the day version of the icon
  expect(d2).toMatchObject({ date: '2026-11-21', icon: '04d' });
});
