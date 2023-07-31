import { useEffect, useRef } from 'react';

import constant from 'lodash/constant';

/**
 *
 * Custom hook to enable horizontal scrolling with mousewheel and without shift key
 */
export const useHorizontalScroll = () => {
  const elRef = useRef<HTMLDivElement | undefined>();
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) {
          return;
        }
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY,
          behavior: 'smooth',
        });
      };
      el.addEventListener('wheel', onWheel);
      return () => el.removeEventListener('wheel', onWheel);
    }
    return constant(true);
  }, []);
  return elRef;
};
