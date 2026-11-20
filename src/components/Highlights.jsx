import { WiBarometer, WiHumidity, WiRaindrop, WiStrongWind, WiSunrise } from 'react-icons/wi';
import { LuEye, LuNavigation } from 'react-icons/lu';
import { localTime } from '../utils/forecast';
import { compass, distance, UNITS, windSpeed } from '../utils/units';

function Tile({ icon: Icon, label, children, footer }) {
  return (
    <div className="glass flex flex-col p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/65">
        <Icon className="size-5" aria-hidden="true" /> {label}
      </p>
      <div className="mt-2 font-display text-2xl font-medium">{children}</div>
      {footer && <div className="mt-auto pt-3 text-xs text-white/70">{footer}</div>}
    </div>
  );
}

function Meter({ value, label }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-amber-200" style={{ width: `${value}%` }} />
    </div>
  );
}

/** Detail tiles: humidity, wind, rain chance, pressure, visibility, sunrise/sunset. */
export default function Highlights({ current, rainChance, unit }) {
  const tz = current.timezone;
  const u = UNITS[unit];
  // Highest chance of rain in the next 24 hours (meaningful at any time of day)
  const rain = Math.round((rainChance ?? 0) * 100);

  return (
    <section aria-label="Today's details" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Tile icon={WiHumidity} label="Humidity" footer={<Meter value={current.main.humidity} label="Humidity" />}>
        {current.main.humidity}%
      </Tile>
      <Tile
        icon={WiStrongWind}
        label="Wind"
        footer={
          <span className="flex items-center gap-1.5">
            <LuNavigation
              className="size-3.5"
              style={{ transform: `rotate(${(current.wind.deg ?? 0) + 180}deg)` }}
              aria-hidden="true"
            />
            From {compass(current.wind.deg)}
          </span>
        }
      >
        {windSpeed(current.wind.speed, unit)} <span className="text-base text-white/70">{u.wind}</span>
      </Tile>
      <Tile icon={WiRaindrop} label="Rain · 24h" footer={<Meter value={rain} label="Chance of rain in the next 24 hours" />}>
        {rain}%
      </Tile>
      <Tile icon={WiBarometer} label="Pressure">
        {current.main.pressure} <span className="text-base text-white/70">hPa</span>
      </Tile>
      <Tile icon={LuEye} label="Visibility" footer={<span>Cloud cover {current.clouds?.all ?? 0}%</span>}>
        {distance(current.visibility ?? 10000, unit)} <span className="text-base text-white/70">{u.distance}</span>
      </Tile>
      <Tile icon={WiSunrise} label="Sun">
        <span className="block text-lg leading-snug">↑ {localTime(current.sys.sunrise, tz)}</span>
        <span className="block text-lg leading-snug text-white/80">↓ {localTime(current.sys.sunset, tz)}</span>
      </Tile>
    </section>
  );
}
