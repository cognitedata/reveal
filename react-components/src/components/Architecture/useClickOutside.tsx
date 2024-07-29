/*!
 * Copyright 2024 Cognite AS
 */

import { useEffect, type RefObject } from 'react';

export function useClickOutside(ref: RefObject<HTMLElement>, callback: () => void): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const current = ref.current;
      if (current !== null && !current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [ref, callback]);
}
