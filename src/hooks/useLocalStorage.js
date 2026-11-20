import { useCallback, useState } from 'react';

/** useState that is remembered in localStorage (and still works if storage is blocked). */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initialValue : JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* storage full or blocked: keep it in memory only */
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, set];
}
