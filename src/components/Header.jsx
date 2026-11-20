import { useState } from 'react';
import { LuLocateFixed } from 'react-icons/lu';
import { reverseGeocode } from '../services/weatherApi';
import SearchBox from './SearchBox';

const GEO_ERRORS = {
  1: 'Location permission was denied. Allow it in your browser settings to use this.',
  2: "Your location couldn't be determined.",
  3: 'Finding your location took too long. Please try again.',
};

function Logo() {
  return (
    <a href="/" className="flex shrink-0 items-center gap-2.5" aria-label="GeoWeather home">
      <img src="/favicon.svg" alt="" width="36" height="36" className="size-8 sm:size-9" />
      <span className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
        Geo<span className="text-amber-200">Weather</span>
      </span>
    </a>
  );
}

export default function Header({ recent, unit, onUnitChange, onSelect, onNotice }) {
  const [locating, setLocating] = useState(false);

  const locate = () => {
    if (!navigator.geolocation) {
      onNotice('Your browser does not support location access.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const pos = { lat: coords.latitude, lon: coords.longitude };
        try {
          onSelect(await reverseGeocode(pos));
        } catch {
          onSelect({ name: 'My location', ...pos }); // still show the weather even if naming fails
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        onNotice(GEO_ERRORS[err.code] || "Couldn't get your location.");
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  return (
    <header className="relative z-40 mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 pt-5 sm:px-6 md:flex-nowrap md:gap-5">
      <Logo />
      <div className="order-last w-full md:order-none md:max-w-xl md:flex-1">
        <SearchBox recent={recent} onSelect={onSelect} />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          aria-label="Use my location"
          title="Use my location"
          className="glass grid size-11 place-items-center rounded-full! transition hover:bg-white/15 disabled:opacity-60 sm:size-12"
        >
          <LuLocateFixed className={`size-5 ${locating ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
        <div role="group" aria-label="Temperature unit" className="glass flex h-11 items-center rounded-full! p-1 sm:h-12">
          {[
            ['metric', '°C'],
            ['imperial', '°F'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={unit === value}
              onClick={() => onUnitChange(value)}
              className={`h-9 rounded-full px-3 text-sm font-semibold transition sm:h-10 sm:px-3.5 ${
                unit === value ? 'bg-white text-slate-900' : 'text-white/75 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
