import { useEffect, useRef } from 'react';

import constant from 'lodash/constant';

/**
 *
 * Custom hook to check element is hovered or not
 */
export const useHoverListener = (onHoverChange?: (value: boolean) => void) => {
  const elRef = useRef<HTMLDivElement | undefined>();
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      const onMouseLeave = () => {
        if (onHoverChange) {
          onHoverChange(false);
        }
      };

      const onMouseEnter = () => {
        if (onHoverChange) {
          onHoverChange(true);
        }
      };

      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('mouseenter', onMouseEnter);
      return () => {
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('mouseenter', onMouseEnter);
      };
    }
    return constant(true);
  }, []);
  return elRef;
};
