import { useEffect } from 'react';

import { TS_FIX_ME } from 'core';

type Props = {
  onKeyDown: (event: KeyboardEvent) => void;
  key?: string;
  deps?: TS_FIX_ME[];
};

export const useKeyPressListener = ({ onKeyDown, key, deps = [] }: Props) => {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!key || key === event.key) {
        onKeyDown(event);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, deps);
};
