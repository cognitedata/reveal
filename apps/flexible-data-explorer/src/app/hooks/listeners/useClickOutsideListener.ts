import { MutableRefObject, useEffect } from 'react';

/**
 * Hook adds the click outside listener to the element.
 *
 * REMEMBER: 'callback' has to be memoized!
 */
export const useClickOutsideListener = (
  callback: () => void,
  ref: MutableRefObject<HTMLDivElement | null>
) => {
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (!ref?.current?.contains(e.target)) {
        callback();
      }
    };

    document.addEventListener('click', handleOutsideClick, false);
    return () => {
      document.addEventListener('click', handleOutsideClick, false);
    };
  }, [callback, ref]);
};
