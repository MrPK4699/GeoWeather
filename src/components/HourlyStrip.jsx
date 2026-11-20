import { WiRaindrop } from 'react-icons/wi';
import { localTime } from '../utils/forecast';
import { formatTemp } from '../utils/units';
import WeatherIcon from './WeatherIcon';

/** Next 24 hours in 3-hour steps, scrollable sideways on small screens. */
export default function HourlyStrip({ list, timezone, unit }) {
  const next = list.slice(0, 8);
  return (
    <section aria-labelledby="hourly-heading" className="glass p-5">
      <h2 id="hourly-heading" className="text-xs font-semibold uppercase tracking-wider text-white/65">
        Next 24 hours
      </h2>
      <ol className="scroll-thin -mx-1 mt-4 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
        {next.map((item, i) => {
          const pop = Math.round((item.pop ?? 0) * 100);
          return (
            <li
              key={item.dt}
              className={`flex min-w-[4.75rem] snap-start flex-col items-center gap-1 rounded-2xl px-2 py-3 ${
                i === 0 ? 'bg-white/15' : 'bg-white/5'
              }`}
            >
              <span className="text-sm text-white/80">{localTime(item.dt, timezone)}</span>
              <WeatherIcon code={item.weather[0].icon} label={item.weather[0].description} className="size-10" />
              <span className="font-display text-lg font-medium">{formatTemp(item.main.temp, unit)}</span>
              <span className={`flex items-center text-xs ${pop > 0 ? 'text-sky-200' : 'text-transparent'}`} aria-hidden={pop === 0}>
                <WiRaindrop className="size-4" aria-hidden="true" />
                {pop}%
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
