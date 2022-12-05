import { useEffect, useRef } from 'react';

type Delay = number | null;
type PollingCallback = () => void;

export const usePolling = (callback: PollingCallback, delay: Delay) => {
  const savedCallback = useRef<PollingCallback>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const tick = () => {
      if (!savedCallback.current) {
        return;
      }
      savedCallback.current();
    };

    if (delay) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [delay]);
};
