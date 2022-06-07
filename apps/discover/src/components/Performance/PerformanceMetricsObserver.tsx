import {
  cloneElement,
  isValidElement,
  PropsWithChildren,
  RefObject,
  useEffect,
  useRef,
} from 'react';

import get from 'lodash/get';

import { PerfMetrics } from '@cognite/metrics';

export type domRef = RefObject<HTMLDivElement>;

export type PerformanceObserved = {
  mutations: MutationRecord[] | undefined;
  data: Array<any> | undefined;
};

type Props<T> = {
  data?: Array<T>;
  onRender?: (ref: domRef) => () => void;
  onChange: (params: PerformanceObserved) => void;
};

export const PerformanceMetricsObserver = <T,>({
  onChange,
  onRender,
  data,
  children,
}: PropsWithChildren<Props<T>>) => {
  /**
   * Creating a ref to use if a ref is not set for children.
   */
  const createdChildrenRef = useRef<HTMLDivElement>(null);

  /**
   * If a ref is already set for children, use that ref.
   * Otherwise, use the created ref above.
   */
  const contentRef: domRef = get(children, 'ref') || createdChildrenRef;

  /**
   * [Performance-Tracker]
   * This needs to be run only on the first load of the component so we can attach our DOM observer.
   */
  useEffect(() => {
    const onRenderCleanup = onRender?.(contentRef);
    PerfMetrics?.observeDom(contentRef, (mutations: MutationRecord[]) => {
      onChange({ mutations, data });
    });
    return () => {
      onRenderCleanup?.();
    };
  }, []);

  useEffect(() => {
    onChange({ mutations: undefined, data });
  }, [data]);

  if (!isValidElement(children)) {
    return null;
  }

  return cloneElement(children, { ref: contentRef });
};
