import { useEffect } from 'react';

export const useKeyboardListener = (callback?: (event: string) => void) => {
  useEffect(() => {
    const handleButton = (event: KeyboardEvent) => {
      callback?.(event.code);
    };

    window.addEventListener('keydown', handleButton);

    return () => {
      window.removeEventListener('keydown', handleButton);
    };
  }, [callback]);
};

export const useEscapeKeyListener = (callback?: () => void) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        callback?.();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [callback]);
};
