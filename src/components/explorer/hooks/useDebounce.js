import { useEffect, useState } from 'react';

// Tiny debounce hook used by the search input. Returns the latest value
// once it has been stable for `delay` ms.
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
