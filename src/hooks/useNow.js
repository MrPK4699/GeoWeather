import { useEffect, useState } from 'react';

/** Current unix time (seconds), refreshed every `ms` (default: each minute) for live clocks. */
export function useNow(ms = 60 * 1000) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
