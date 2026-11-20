import { useId } from 'react';
import { smoothPath, svgId } from '../utils/chart';
import { rainAmount, temp, UNITS } from '../utils/units';
import { Legend } from './DayChart';

const W = 640;
const H = 280;
const PAD = { top: 30, right: 30, bottom: 74, left: 30 };
const RAIN_H = 30;

const shortDay = (ymd) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
const dayNum = (ymd) => Number(ymd.slice(8, 10));

/**
 * 7 days at a glance: daily high and low lines with the band between them filled,
 * and rainfall bars (mm / in).
 */
export default function RangeChart({ days, unit, label }) {
  const id = svgId(useId());
  const highs = days.map((d) => temp(d.max, unit));
  const lows = days.map((d) => temp(d.min, unit));
  const lo = Math.min(...lows);
  const hi = Math.max(...highs);
  const span = Math.max(hi - lo, 1);
  const LOW_LABEL = 24; // room for the low-temperature labels so they never overlap the rain bars
  const plotH = H - PAD.top - PAD.bottom - RAIN_H - LOW_LABEL;
  const step = (W - PAD.left - PAD.right) / Math.max(days.length - 1, 1);
  const x = (i) => PAD.left + i * step;
  const y = (v) => PAD.top + (1 - (v - lo) / span) * plotH;
  const maxRain = Math.max(...days.map((d) => d.rain), 1);
  const rainBase = H - PAD.bottom + 2;

  const hiPts = highs.map((v, i) => [x(i), y(v)]);
  const loPts = lows.map((v, i) => [x(i), y(v)]);
  const hiPath = smoothPath(hiPts);
  const loPath = smoothPath(loPts);
  // Band between the two lines: high line forward, low line backward
  const band = `${hiPath} L${loPts.at(-1)[0]},${loPts.at(-1)[1]} ${smoothPath([...loPts].reverse()).slice(1)} Z`;

  const u = UNITS[unit];
  const summary = days
    .map((d, i) => `${shortDay(d.date)} ${dayNum(d.date)}: high ${highs[i]}${u.temp}, low ${lows[i]}${u.temp}, rain ${rainAmount(d.rain, unit)} ${u.rain}`)
    .join('; ');

  return (
    <>
      <Legend
        items={[
          ['line', 'bg-orange-300', `High ${u.temp}`],
          ['line', 'bg-sky-300', `Low ${u.temp}`],
          ['bar', 'bg-sky-300/60', `Rain ${u.rain}`],
        ]}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-auto w-full" role="img" aria-label={`${label}: daily high, low and rainfall. ${summary}`}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {days.map((d, i) => {
            const h = d.rain > 0 ? Math.max((d.rain / maxRain) * RAIN_H, 2) : 0;
            return <rect key={`r${d.date}`} x={x(i) - 13} y={rainBase - h} width="26" height={h} rx="3" fill="rgb(125 211 252 / 0.6)" />;
          })}

          <path d={band} fill={`url(#${id})`} />
          <path d={hiPath} fill="none" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" />
          <path d={loPath} fill="none" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />

          {days.map((d, i) => (
            <g key={d.date}>
              <circle cx={x(i)} cy={hiPts[i][1]} r="4" fill="#0f172a" stroke="#fdba74" strokeWidth="2.5" />
              <circle cx={x(i)} cy={loPts[i][1]} r="4" fill="#0f172a" stroke="#7dd3fc" strokeWidth="2.5" />
              <text x={x(i)} y={hiPts[i][1] - 10} textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
                {highs[i]}°
              </text>
              <text x={x(i)} y={loPts[i][1] + 20} textAnchor="middle" fill="rgb(255 255 255 / 0.75)" fontSize="13">
                {lows[i]}°
              </text>
              <text x={x(i)} y={rainBase + 14} textAnchor="middle" fill="rgb(186 230 253)" fontSize="11">
                {d.rain > 0 ? rainAmount(d.rain, unit) : '–'}
              </text>
              <text x={x(i)} y={H - 22} textAnchor="middle" fill="white" fontSize="13" fontWeight="600">
                {shortDay(d.date)}
              </text>
              <text x={x(i)} y={H - 6} textAnchor="middle" fill="rgb(255 255 255 / 0.6)" fontSize="12">
                {dayNum(d.date)}
              </text>
            </g>
          ))}
      </svg>
    </>
  );
}
