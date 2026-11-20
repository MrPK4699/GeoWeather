import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { LuX } from 'react-icons/lu';
import Backdrop from './components/Backdrop';
import CurrentCard from './components/CurrentCard';
import DailyForecast from './components/DailyForecast';
import ChartCard from './components/ChartCard';
import Header from './components/Header';
import Highlights from './components/Highlights';
import HourlyStrip from './components/HourlyStrip';
import { ErrorView, LoadingView } from './components/StatusViews';
import { DEFAULT_LOCATION, placeLabel, samePlace } from './data/cities';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNow } from './hooks/useNow';
import { useDailyRange, useWeather } from './hooks/useWeather';
import { getErrorMessage } from './services/weatherApi';
import { localDate, summarizeDays } from './utils/forecast';
import { getScene, isNightIcon } from './utils/scene';

// Leaflet is large; load the map only when it's needed
const WeatherMap = lazy(() => import('./components/WeatherMap'));

export default function App() {
  const [place, setPlace] = useLocalStorage('gw-place', DEFAULT_LOCATION);
  const [recent, setRecent] = useLocalStorage('gw-recent', []);
  const [unit, setUnit] = useLocalStorage('gw-unit', 'metric');
  const [selectedDay, setSelectedDay] = useState(null);
  const [notice, setNotice] = useState('');

  const { current, forecast, isLoading, error, refetch } = useWeather(place);

  const now = useNow();
  // Full-day figures (incl. hours already passed) from Open-Meteo; also used by the 7-day chart tabs
  const range = useDailyRange(place, true);
  const fullToday = range.data?.today;
  const days = useMemo(() => {
    if (!forecast) return [];
    const list = summarizeDays(forecast.list, forecast.city.timezone).slice(0, 5);
    // The 3-hour forecast only covers the REST of today (late at night: maybe one slot),
    // so widen today's high/low with the whole day's values when we have them.
    return list.map((d) =>
      fullToday && d.date === fullToday.date
        ? { ...d, min: Math.min(d.min, fullToday.min), max: Math.max(d.max, fullToday.max) }
        : d
    );
  }, [forecast, fullToday]);
  const day = days.find((d) => d.date === selectedDay) ?? days[0];
  // The city's actual date right now. Late at night the forecast already starts tomorrow,
  // so the first forecast day is NOT always "today".
  const todayDate = forecast ? localDate(now, forecast.city.timezone) : '';
  const today = days.find((d) => d.date === todayDate);
  const rainNext24h = forecast ? Math.max(0, ...forecast.list.slice(0, 8).map((i) => i.pop ?? 0)) : 0;

  const scene = current ? getScene(current.weather[0].id, isNightIcon(current.weather[0].icon)) : 'clouds-night';

  useEffect(() => {
    document.title = current ? `${placeLabel(place)} · ${Math.round(current.main.temp)}°C · GeoWeather` : 'GeoWeather';
  }, [current, place]);

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(id);
  }, [notice]);

  const selectPlace = (p) => {
    setPlace(p);
    setSelectedDay(null);
    setRecent((list) => [p, ...list.filter((r) => !samePlace(r, p))].slice(0, 5));
  };

  return (
    <>
      <Backdrop scene={scene} />
      <div className="flex min-h-svh flex-col">
        <Header recent={recent} unit={unit} onUnitChange={setUnit} onSelect={selectPlace} onNotice={setNotice} />

        {notice && (
          <div role="status" className="mx-auto mt-3 flex w-full max-w-7xl px-4 sm:px-6">
            <p className="glass flex items-center gap-3 rounded-full! bg-amber-500/20! px-4 py-2 text-sm">
              {notice}
              <button type="button" aria-label="Dismiss" onClick={() => setNotice('')} className="text-white/70 hover:text-white">
                <LuX className="size-4" />
              </button>
            </p>
          </div>
        )}

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {error && !current ? (
            <ErrorView message={getErrorMessage(error)} onRetry={refetch} />
          ) : isLoading || !current || !forecast ? (
            <LoadingView />
          ) : (
            // grid-cols-1 = one column capped at the screen width (minmax(0,1fr)); without it the
            // column grows to fit the hourly strip and the whole page overflows on phones
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="min-w-0 space-y-5 lg:col-span-5">
                <CurrentCard place={place} current={current} today={today} unit={unit} />
                <Highlights current={current} rainChance={rainNext24h} unit={unit} />
              </div>
              <div className="min-w-0 space-y-5 lg:col-span-7">
                <HourlyStrip list={forecast.list} timezone={forecast.city.timezone} unit={unit} />
                <DailyForecast days={days} todayDate={todayDate} selected={day?.date} onSelect={setSelectedDay} unit={unit} />
              </div>
              {/* Chart and map side by side, same width (6 + 6) and same height (row stretches, cards fill it) */}
              {day && (
                <div className="min-w-0 lg:col-span-6">
                  <ChartCard
                    place={place}
                    day={day}
                    next24={forecast.list.slice(0, 8)}
                    timezone={forecast.city.timezone}
                    unit={unit}
                    todayDate={todayDate}
                  />
                </div>
              )}
              <div className="min-w-0 lg:col-span-6">
                <Suspense fallback={<div className="glass h-full min-h-80 animate-pulse" />}>
                  <WeatherMap place={place} />
                </Suspense>
              </div>
            </div>
          )}
        </main>

        <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-center text-xs text-white/60 sm:px-6">
          Weather data ©{' '}
          <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            OpenWeather
          </a>{' '}
          · 7-day history &amp; outlook by{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            Open-Meteo
          </a>{' '}
          · Built by{' '}
          <a href="https://mrpk4699.github.io/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            Pankaj Khatri
          </a>
        </footer>
      </div>
    </>
  );
}
