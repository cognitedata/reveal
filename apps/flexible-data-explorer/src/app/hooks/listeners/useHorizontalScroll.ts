import { useEffect, useRef } from 'react';

export const useHorizontalScroll = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (element) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) {
          return;
        }
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
          element.scrollLeft += e.deltaX;
        }
        element.scrollTo({ left: element.scrollLeft + e.deltaY });
      };

      element.addEventListener('wheel', onWheel);
      return () => element.removeEventListener('wheel', onWheel);
    }
  }, []);

  return ref;
};
