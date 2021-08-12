import { useEffect } from 'react';

export const useOnEscClick = (callback: () => void) => {
  useEffect(() => {
    function upHandler(event: KeyboardEvent) {
      if (event.key === 'Escape' || event.code === 'Escape') {
        callback();
      }
    }
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keyup', upHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
