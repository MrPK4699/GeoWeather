import { useId } from 'react';
import { smoothPath, svgId } from '../utils/chart';
import { localTime } from '../utils/forecast';
import { temp, UNITS } from '../utils/units';

const W = 640;
const H = 240;
const PAD = { top: 36, right: 24, bottom: 56, left: 24 };
const RAIN_H = 26; // height reserved for rain bars at the bottom

/**
 * Temperature curve + chance-of-rain bars for one day (3-hour steps), drawn as plain SVG.
 * Rendered inside ChartCard; `title` is the accessible name (e.g. "Today").
 */
export default function DayChart({ day, timezone, unit, title }) {
  const gradId = svgId(useId());
  const items = day.items;
  const values = items.map((i) => temp(i.main.temp, unit));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const plotH = H - PAD.top - PAD.bottom - RAIN_H;
  const step = items.length > 1 ? (W - PAD.left - PAD.right) / (items.length - 1) : 0;

  const pts = values.map((v, i) => [
    items.length > 1 ? PAD.left + i * step : W / 2,
    PAD.top + (1 - (v - min) / range) * plotH,
  ]);
  const line = smoothPath(pts);
  const baseY = PAD.top + plotH;
  const area = line ? `${line} L${pts.at(-1)[0]},${baseY} L${pts[0][0]},${baseY} Z` : '';
  const barW = Math.min(28, step * 0.5 || 28);

  const summary = items
    .map((it, i) => `${localTime(it.dt, timezone)} ${values[i]}${UNITS[unit].temp}, ${Math.round((it.pop ?? 0) * 100)}% rain`)
    .join('; ');

  return (
    <>
      <Legend items={[['line', 'bg-amber-200', UNITS[unit].temp], ['bar', 'bg-sky-300/60', 'Rain chance %']]} />
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-auto w-full" role="img" aria-label={`${title}: temperature and chance of rain. ${summary}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {items.map((it, i) => {
          const pop = it.pop ?? 0;
          const h = Math.max(pop * RAIN_H, pop > 0 ? 2 : 0);
          return (
            <rect key={`r${it.dt}`} x={pts[i][0] - barW / 2} y={H - PAD.bottom - h + 4} width={barW} height={h} rx="3" fill="rgb(125 211 252 / 0.6)" />
          );
        })}

        {area && <path d={area} fill={`url(#${gradId})`} />}
        {line && <path d={line} fill="none" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" />}

        {pts.map(([x, y], i) => (
          <g key={items[i].dt}>
            <circle cx={x} cy={y} r="4.5" fill="#0f172a" stroke="#fde68a" strokeWidth="2.5" />
            <text x={x} y={y - 12} textAnchor="middle" fill="white" fontSize="15" fontWeight="600">
              {values[i]}°
            </text>
            <text x={x} y={H - 12} textAnchor="middle" fill="rgb(255 255 255 / 0.7)" fontSize="13">
              {localTime(items[i].dt, timezone)}
            </text>
            <text x={x} y={H - PAD.bottom + 26} textAnchor="middle" fill="rgb(186 230 253)" fontSize="11">
              {Math.round((items[i].pop ?? 0) * 100)}%
            </text>
          </g>
        ))}
      </svg>
    </>
  );
}

/** Small colour key shown above a chart. items: [kind ('line' | 'bar'), colour class, label] */
export function Legend({ items }) {
  return (
    <p className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-xs text-white/70">
      {items.map(([kind, colour, label]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`${kind === 'line' ? 'h-0.5 w-4 rounded' : 'size-2.5 rounded-sm'} ${colour}`} aria-hidden="true" />
          {label}
        </span>
      ))}
    </p>
  );
}
