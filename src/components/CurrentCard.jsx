import { LuMapPin } from 'react-icons/lu';
import { placeLabel } from '../data/cities';
import { useNow } from '../hooks/useNow';
import { formatLocalDateTime } from '../utils/forecast';
import { formatTemp, UNITS } from '../utils/units';
import WeatherIcon from './WeatherIcon';

/** Big "right now" card: place, local time, temperature, condition, feels-like and today's range. */
export default function CurrentCard({ place, current, today, unit }) {
  const now = useNow();
  const w = current.weather[0];

  return (
    <section aria-labelledby="current-heading" className="glass relative overflow-hidden p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 id="current-heading" className="flex items-start gap-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
            <LuMapPin className="mt-1 size-6 shrink-0 text-amber-200" aria-hidden="true" />
            <span className="break-words">{placeLabel(place)}</span>
          </h1>
          <p className="mt-1 text-sm text-white/75">{formatLocalDateTime(now, current.timezone)} (local time)</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-7xl font-light leading-none tracking-tighter sm:text-8xl" data-testid="current-temp">
            {formatTemp(current.main.temp, unit)}
            <span className="ml-1 align-top text-3xl font-normal text-white/70 sm:text-4xl">{UNITS[unit].temp.slice(1)}</span>
          </p>
          <p className="mt-3 text-xl font-medium capitalize">{w.description}</p>
          <p className="mt-1 text-sm text-white/75">
            Feels like {formatTemp(current.main.feels_like, unit)}
            {today && (
              <>
                {' · '}H {formatTemp(today.max, unit)} · L {formatTemp(today.min, unit)}
              </>
            )}
          </p>
        </div>
        <WeatherIcon code={w.icon} label={w.description} animated className="size-32 shrink-0 text-amber-100 drop-shadow-[0_10px_30px_rgba(253,230,138,0.35)] sm:size-40" />
      </div>
    </section>
  );
}
