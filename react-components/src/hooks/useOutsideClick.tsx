/*!
 * Copyright 2023 Cognite AS
 */

import { type MutableRefObject, useEffect, useRef } from 'react';

export const useOutsideClick = (callback: () => void): MutableRefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      const container = ref.current;

      if (container !== null && !container.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [callback]);

  return ref;
};
