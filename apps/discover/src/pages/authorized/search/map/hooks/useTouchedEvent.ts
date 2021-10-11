import { useState } from 'react';

/**
 * Custom hook for map touched event with debounce time
 * @param debounceTime - Debounce time for mousedown event
 */
export const useTouchedEvent = (debounceTime = 150) => {
  const [touched, setTouched] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const touchedEvent = [
    {
      type: 'mousedown',
      callback: () => {
        setTimer(setTimeout(() => setTouched(true), debounceTime));
      },
    },
    {
      type: 'mouseup',
      callback: () => {
        if (timer) {
          clearTimeout(timer);
          setTimer(undefined);
        }
        setTouched(false);
      },
    },
  ];
  return { touched, touchedEvent };
};
