import { useState, useRef } from 'react';

import { MapEvent } from '../types';

/**
 * Custom hook for map touched event with debounce time
 * @param debounceTime - Debounce time for mousedown event
 */
export const useTouchedEvent = (debounceTime = 150) => {
  const [touched, setTouched] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const touchedEvent: MapEvent[] = [
    {
      type: 'mousedown',
      callback: () => {
        timerRef.current = setTimeout(() => setTouched(true), debounceTime);
      },
    },
    {
      type: 'mouseup',
      callback: () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = undefined;
        }
        setTouched(false);
      },
    },
  ];

  return { touched, touchedEvent };
};
