import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

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
    let isCancelled = false;

    const pollingFn = () => {
      if (ref.current == null) {
        return;
      }
      ref.current(() => isCancelled);
    };

    const intervalId = setInterval(pollingFn, delay);
    if (immediate) {
      pollingFn();
    }

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [delay, immediate]);
};
