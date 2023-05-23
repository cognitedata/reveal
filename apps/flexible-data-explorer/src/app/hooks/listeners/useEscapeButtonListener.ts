import { useEffect } from 'react';

export const useEscapeButtonListener = (callback?: () => void) => {
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
