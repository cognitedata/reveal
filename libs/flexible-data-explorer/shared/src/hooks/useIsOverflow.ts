import React, { useEffect, useState } from 'react';

/**
 * This hook gets an HTMLElement as ref and computes if it is overflowing
 * @param ref ref object to an HTMLElement
 * @returns boolean flag whether the HTMLElement is overflowing
 */
export const useIsOverflow = (ref: React.RefObject<HTMLElement>) => {
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (
      ref.current?.clientWidth &&
      ref.current?.scrollWidth &&
      ref.current?.clientHeight &&
      ref.current?.scrollHeight
    ) {
      if (
        ref.current?.clientWidth < ref.current?.scrollWidth ||
        ref.current?.clientHeight < ref.current?.scrollHeight ||
        ref.current?.offsetWidth < ref.current?.scrollWidth
      ) {
        setIsOverflow(true);
      } else {
        setIsOverflow(false);
      }
    }
  }, [ref]);

  return isOverflow;
};
