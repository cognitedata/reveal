import { useEffect, useMemo, useRef, useState } from 'react';

import throttle from 'lodash/throttle';

export * from './dataSet';
export * from './job';
export * from './notifications';
export * from './project';
export * from './schedule';
export * from './sdk-queries';
export * from './sequences';
export * from './transformation';
export * from './user';

export interface ScrollState {
  /**
   * Scrollbar position. Starts at 0, and should be constantly 0, in case there's no scrollbar.
   */
  horizontalOffset: number;
  /**
   * Scrollbar position. Starts at 0, and should be constantly 0, in case there's no scrollbar.
   */
  verticalOffset: number;
  /**
   * Total scrollable height.
   */
  scrollHeight: number;
  /**
   * Total scrollable width.
   */
  scrollWidth: number;
  /**
   * Scroll ratio value is between 0 and 1.
   */
  horizontalRatio: number;
  /**
   * Scroll ratio value is between 0 and 1.
   */
  verticalRatio: number;
}

const getScrollState = (event: Event): ScrollState => {
  const target = event.target as HTMLElement;
  return {
    scrollWidth: target.scrollWidth,
    horizontalOffset: target.scrollLeft,
    horizontalRatio:
      (target.scrollLeft + target.clientWidth) / target.scrollWidth,
    scrollHeight: target.scrollHeight,
    verticalOffset: target.scrollTop,
    verticalRatio:
      (target.scrollTop + target.clientHeight) / target.scrollHeight,
  };
};

export const useScrollCallback = (
  element: Element | Document | null = document,
  callback: (scrollState: ScrollState, event: Event) => void,
  throttleTime: number = 1000
) => {
  const throttledListener = useMemo(() => {
    return throttle((e) => callback(getScrollState(e), e), throttleTime, {
      leading: true,
      trailing: true,
    });
  }, [callback, throttleTime]);

  useEffect(() => {
    element?.addEventListener('scroll', throttledListener);
    return () => {
      element?.removeEventListener('scroll', throttledListener);
    };
  }, [element, throttledListener]);

  // eslint-disable-next-line no-restricted-globals
  return scroll;
};

export const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);
  return debouncedValue;
};

export const useDuration = (
  startTimeInMs: number | undefined,
  finishTimeInMs: number | undefined
) => {
  const [durationInMs, setDurationInMs] = useState(
    (finishTimeInMs ?? new Date().getTime()) -
      (startTimeInMs ?? new Date().getTime())
  );

  const intervalId = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (finishTimeInMs) {
      setDurationInMs(finishTimeInMs - (startTimeInMs ?? new Date().getTime()));
      clearInterval(intervalId.current);
    } else if (!intervalId.current && startTimeInMs) {
      intervalId.current = setInterval(() => {
        setDurationInMs(new Date().getTime() - startTimeInMs);
      }, 1000);
    }
  }, [startTimeInMs, finishTimeInMs, durationInMs]);

  useEffect(() => {
    return () => {
      clearInterval(intervalId.current);
    };
  }, []);

  return durationInMs;
};
