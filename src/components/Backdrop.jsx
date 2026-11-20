import { memo, useMemo } from 'react';
import { SCENES } from '../utils/scene';

// Stable pseudo-random numbers (same layout on every render, no jumping particles)
const rand = (i, salt) => {
  const x = Math.sin(i * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
};
const range = (n) => Array.from({ length: n }, (_, i) => i);

function Stars() {
  return range(120).map((i) => (
    <span
      key={i}
      className="star"
      style={{
        left: `${rand(i, 1) * 100}%`,
        top: `${rand(i, 2) * 96}%`,
        opacity: 0.45 + rand(i, 3) * 0.55,
        '--size': `${2 + rand(i, 19) * 1.6}px`,
        animationDelay: `${rand(i, 4) * 3}s`,
      }}
    />
  ));
}

function Clouds({ count = 5 }) {
  return range(count).map((i) => (
    <span
      key={i}
      className="cloud"
      style={{
        top: `${5 + rand(i, 5) * 45}%`,
        width: `${22 + rand(i, 6) * 25}rem`,
        height: `${7 + rand(i, 7) * 7}rem`,
        animationDuration: `${70 + rand(i, 8) * 70}s`,
        animationDelay: `${-rand(i, 9) * 120}s`,
      }}
    />
  ));
}

function Rain({ count = 90 }) {
  return range(count).map((i) => (
    <span
      key={i}
      className="drop"
      style={{
        left: `${rand(i, 10) * 110}%`,
        opacity: 0.3 + rand(i, 11) * 0.6,
        animationDuration: `${0.55 + rand(i, 12) * 0.5}s`,
        animationDelay: `${-rand(i, 13) * 2}s`,
      }}
    />
  ));
}

function Snow() {
  return range(70).map((i) => {
    const size = 2 + rand(i, 14) * 5;
    return (
      <span
        key={i}
        className="flake"
        style={{
          left: `${rand(i, 15) * 100}%`,
          width: size,
          height: size,
          opacity: 0.4 + rand(i, 16) * 0.6,
          animationDuration: `${8 + rand(i, 17) * 10}s`,
          animationDelay: `${-rand(i, 18) * 18}s`,
        }}
      />
    );
  });
}

function Mist() {
  return [12, 42, 72].map((top, i) => (
    <span key={top} className="mist" style={{ top: `${top}%`, animationDelay: `${-i * 9}s` }} />
  ));
}

const LAYERS = {
  'clear-day': () => <span className="sun-glow" />,
  'clear-night': () => <Stars />,
  'clouds-day': () => <Clouds count={6} />,
  'clouds-night': () => (
    <>
      <Stars />
      <Clouds count={4} />
    </>
  ),
  rain: () => (
    <>
      <Clouds count={4} />
      <Rain />
    </>
  ),
  thunder: () => (
    <>
      <Clouds count={4} />
      <Rain count={110} />
      <span className="lightning" />
    </>
  ),
  snow: () => (
    <>
      <Clouds count={3} />
      <Snow />
    </>
  ),
  mist: () => <Mist />,
};

/**
 * Full-screen animated background for the current weather.
 * Every scene is mounted once and cross-fades, so switching city looks smooth.
 */
function Backdrop({ scene }) {
  const layers = useMemo(
    () =>
      SCENES.map((name) => {
        const Layer = LAYERS[name];
        return { name, content: <Layer /> };
      }),
    []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true" data-scene={scene}>
      {layers.map(({ name, content }) => (
        <div key={name} className={`scene scene-${name} ${name === scene ? 'is-active' : ''}`}>
          {name === scene && content}
        </div>
      ))}
      {/* Darken the bottom slightly so cards stay readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
    </div>
  );
}

export default memo(Backdrop);
