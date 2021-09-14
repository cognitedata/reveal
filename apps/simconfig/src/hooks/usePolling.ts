import { useRef, useEffect, MutableRefObject } from 'react';

type PollingCallback = (callback: () => void) => void;

export const usePolling = (
  callback: PollingCallback,
  delay: number,
  immediate = true
) => {
  const ref: MutableRefObject<PollingCallback | null> = useRef(null);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    let cancelled = false;

    const pollingFn = () => {
      if (ref.current == null) {
        return;
      }
      ref.current(() => cancelled);
    };

    const intervalId = setInterval(pollingFn, delay);
    if (immediate) {
      pollingFn();
    }

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [delay, immediate]);
};
