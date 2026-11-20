import { WiRaindrop } from 'react-icons/wi';
import { formatWeekday } from '../utils/forecast';
import { formatTemp } from '../utils/units';
import WeatherIcon from './WeatherIcon';

/**
 * 5-day list. Each row shows the day's min-max as a bar on a shared scale (like Apple Weather).
 * Clicking a day selects it for the chart below.
 */
export default function DailyForecast({ days, todayDate, selected, onSelect, unit }) {
  const lo = Math.min(...days.map((d) => d.min));
  const hi = Math.max(...days.map((d) => d.max));
  const span = Math.max(hi - lo, 1);

  return (
    <section aria-labelledby="daily-heading" className="glass p-5">
      <h2 id="daily-heading" className="text-xs font-semibold uppercase tracking-wider text-white/65">
        5-day forecast
      </h2>
      <ul className="mt-3 divide-y divide-white/10">
        {days.map((d) => {
          const isSelected = d.date === selected;
          const pop = Math.round(d.pop * 100);
          return (
            <li key={d.date}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(d.date)}
                className={`grid w-full grid-cols-[5.5rem_2.5rem_3rem_minmax(0,1fr)] items-center gap-2 rounded-xl px-2 py-2.5 text-left transition sm:grid-cols-[7rem_2.5rem_3rem_minmax(0,1fr)] ${
                  isSelected ? 'bg-white/15' : 'hover:bg-white/10'
                }`}
              >
                <span className="font-medium">{d.date === todayDate ? 'Today' : formatWeekday(d.date)}</span>
                <WeatherIcon code={d.icon} label={d.description} className="size-9" />
                <span className="flex items-center text-xs text-sky-200">
                  {pop > 0 && (
                    <>
                      <WiRaindrop className="size-4" aria-hidden="true" />
                      {pop}%
                    </>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  <span className="w-9 text-right text-white/70">{formatTemp(d.min, unit)}</span>
                  <span className="relative h-1.5 flex-1 rounded-full bg-white/15" aria-hidden="true">
                    <span
                      className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-300 via-amber-200 to-orange-400"
                      style={{ left: `${((d.min - lo) / span) * 100}%`, right: `${((hi - d.max) / span) * 100}%` }}
                    />
                  </span>
                  <span className="w-9 font-semibold">{formatTemp(d.max, unit)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
