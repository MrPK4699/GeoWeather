import { useId, useRef, useState } from 'react';
import { LuArrowDown, LuArrowUp, LuMinus } from 'react-icons/lu';
import { useDailyRange } from '../hooks/useWeather';
import { getErrorMessage } from '../services/weatherApi';
import { formatWeekday } from '../utils/forecast';
import { rainAmount, temp, tempDelta, UNITS } from '../utils/units';
import { summarizeRange } from '../utils/wmo';
import DayChart from './DayChart';
import RangeChart from './RangeChart';

/**
 * One card, three views:
 *  - the selected day in 3-hour steps (OpenWeather)
 *  - last 7 days / next 7 days, each compared with the other week (Open-Meteo)
 */
export default function ChartCard({ place, day, next24, timezone, unit, todayDate }) {
  const [tab, setTab] = useState('day');
  const baseId = useId();
  const tabRefs = useRef([]);
  const range = useDailyRange(place, tab !== 'day');

  // For today, show the next 24 hours instead of only what's left of the calendar day
  // (late in the evening that can be a single 3-hour slot, i.e. an almost empty chart).
  const isToday = day.date === todayDate;
  const dayLabel = isToday ? 'Next 24 h' : formatWeekday(day.date);
  const dayForChart = isToday ? { ...day, items: next24 } : day;
  const tabs = [
    { id: 'day', label: dayLabel },
    { id: 'past', label: 'Last 7 days' },
    { id: 'next', label: 'Next 7 days' },
  ];

  // Arrow keys move between tabs (standard tablist behaviour)
  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === tab);
    const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : -1;
    if (next >= 0) {
      e.preventDefault();
      setTab(tabs[next].id);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <section aria-labelledby={`${baseId}-h`} className="glass flex h-full flex-col p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`${baseId}-h`} className="text-xs font-semibold uppercase tracking-wider text-white/65">
          Temperature &amp; rain
        </h2>
        <div role="tablist" aria-label="Chart period" onKeyDown={onKeyDown} className="flex rounded-full bg-white/10 p-1">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`${baseId}-panel`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                tab === t.id ? 'bg-white text-slate-900' : 'text-white/75 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${tab}`}
        className="mt-4 flex flex-1 flex-col justify-center"
      >
        {tab === 'day' && <DayChart day={dayForChart} timezone={timezone} unit={unit} title={dayLabel} />}

        {tab !== 'day' && range.isPending && <div className="h-64 animate-pulse rounded-2xl bg-white/10" aria-label="Loading 7-day data" />}
        {tab !== 'day' && range.isError && (
          <div role="alert" className="rounded-2xl bg-rose-500/15 p-4 text-sm">
            Couldn&apos;t load 7-day data. {getErrorMessage(range.error)}{' '}
            <button type="button" onClick={() => range.refetch()} className="font-semibold underline">
              Try again
            </button>
          </div>
        )}
        {tab !== 'day' && range.data && (
          <>
            <Comparison
              current={tab === 'past' ? range.data.past : range.data.next}
              other={tab === 'past' ? range.data.next : range.data.past}
              otherLabel={tab === 'past' ? 'next 7 days' : 'last 7 days'}
              unit={unit}
            />
            <RangeChart days={tab === 'past' ? range.data.past : range.data.next} unit={unit} label={tabs.find((t) => t.id === tab).label} />
          </>
        )}
      </div>
    </section>
  );
}

/** Three stat tiles: this week's average high/low and total rain, each vs the other week. */
function Comparison({ current, other, otherLabel, unit }) {
  const a = summarizeRange(current);
  const b = summarizeRange(other);
  const u = UNITS[unit];

  const stats = [
    { label: 'Avg high', value: `${temp(a.avgHigh, unit)}°`, diff: tempDelta(a.avgHigh - b.avgHigh, unit), suffix: '°', up: 'warmer', down: 'cooler' },
    { label: 'Avg low', value: `${temp(a.avgLow, unit)}°`, diff: tempDelta(a.avgLow - b.avgLow, unit), suffix: '°', up: 'warmer', down: 'cooler' },
    {
      label: 'Total rain',
      value: `${rainAmount(a.rainTotal, unit)} ${u.rain}`,
      diff: rainAmount(a.rainTotal - b.rainTotal, unit),
      suffix: ` ${u.rain}`,
      up: 'more',
      down: 'less',
      note: `${a.rainyDays} rainy day${a.rainyDays === 1 ? '' : 's'}`,
    },
  ];

  return (
    <dl className="mb-3 grid grid-cols-3 gap-2" data-testid="comparison">
      {stats.map((s) => {
        const Icon = s.diff > 0 ? LuArrowUp : s.diff < 0 ? LuArrowDown : LuMinus;
        const abs = Math.abs(s.diff);
        return (
          <div key={s.label} className="rounded-2xl bg-white/10 px-3 py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{s.label}</dt>
            <dd className="font-display text-xl font-semibold">{s.value}</dd>
            <dd className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70">
              <Icon className="size-3 shrink-0" aria-hidden="true" />
              <span>
                {s.diff === 0 ? 'same as' : `${abs}${s.suffix} ${s.diff > 0 ? s.up : s.down} than`} {otherLabel}
              </span>
            </dd>
            {s.note && <dd className="text-[11px] text-white/55">{s.note}</dd>}
          </div>
        );
      })}
    </dl>
  );
}
