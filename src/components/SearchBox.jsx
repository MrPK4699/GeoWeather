import { useEffect, useId, useRef, useState } from 'react';
import { LuHistory, LuMapPin, LuSearch, LuX } from 'react-icons/lu';
import { POPULAR_CITIES, placeLabel } from '../data/cities';
import { useCitySearch } from '../hooks/useWeather';

/**
 * City search with autocomplete (accessible combobox).
 * Empty input shows recent searches and popular cities; typing 2+ letters searches OpenWeather.
 */
export default function SearchBox({ recent, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  const typing = query.trim().length >= 2;
  const search = useCitySearch(query);

  const options = typing
    ? (search.data ?? []).map((p) => ({ place: p, group: 'Results' }))
    : [
        ...recent.map((p) => ({ place: p, group: 'Recent' })),
        ...POPULAR_CITIES.filter((c) => !recent.some((r) => placeLabel(r) === placeLabel(c))).map((p) => ({
          place: p,
          group: 'Popular',
        })),
      ];

  useEffect(() => setActive(0), [query, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const choose = (place) => {
    onSelect(place);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && options[active]) {
      e.preventDefault();
      choose(options[active].place);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const optionId = (i) => `${listId}-opt-${i}`;
  let lastGroup = null;

  return (
    <div ref={wrapRef} className="relative w-full">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search for a city
      </label>
      <LuSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/60" aria-hidden="true" />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && options[active] ? optionId(active) : undefined}
        autoComplete="off"
        placeholder="Search a city…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="glass h-12 w-full rounded-full! pl-12 pr-10 text-base text-white placeholder:text-white/55 outline-none transition focus:border-amber-200/60"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LuX className="size-4" />
        </button>
      )}

      {open && (
        <div className="glass absolute inset-x-0 top-14 z-50 max-h-96 overflow-y-auto bg-slate-900/80! p-2">
          {typing && search.isFetching && !search.data && <p className="px-3 py-3 text-sm text-white/70">Searching…</p>}
          {typing && search.isError && <p className="px-3 py-3 text-sm text-rose-200">Search failed. Try again.</p>}
          {typing && search.data && options.length === 0 && (
            <p className="px-3 py-3 text-sm text-white/70">No cities found for “{query.trim()}”.</p>
          )}
          <ul id={listId} role="listbox" aria-label="Cities">
            {options.map(({ place, group }, i) => {
              const header = group !== lastGroup && !typing ? group : null;
              lastGroup = group;
              const Icon = group === 'Recent' ? LuHistory : LuMapPin;
              return (
                <li key={`${group}-${placeLabel(place)}-${place.lat}`} role="presentation">
                  {header && (
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-white/50">{header}</p>
                  )}
                  <div
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === active}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => choose(place)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                      i === active ? 'bg-white/15' : ''
                    }`}
                  >
                    <Icon className="size-4 shrink-0 text-amber-200" aria-hidden="true" />
                    <span className="truncate">{placeLabel(place)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
