/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, type RefObject } from 'react';

export const useOutsideClick = (ref: RefObject<HTMLElement | null>, callback: () => void): void => {
  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      if (ref.current !== null && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [ref, callback]);
};
