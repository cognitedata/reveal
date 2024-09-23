/*!
 * Copyright 2024 Cognite AS
 */

import { useEffect, type RefObject } from 'react';

export function useClickOutside(ref: RefObject<HTMLElement>, callback: () => boolean): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const current = ref.current;
      const target = event.target as Node;
      if (current !== null && !current.contains(target)) {
        if (callback()) {
          event.stopPropagation();
          event.preventDefault();
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [ref, callback]);
}
