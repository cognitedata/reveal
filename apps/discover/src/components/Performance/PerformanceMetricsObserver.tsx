import { MutableRefObject, ReactNode, useEffect, useRef } from 'react';

import { PerfMetrics } from '@cognite/metrics';

export type PerformanceObserved = {
  mutations: MutationRecord[] | undefined;
  data: Array<any> | undefined;
};

export type Props<T> = {
  data?: Array<T>;
  onRender?: (ref: MutableRefObject<HTMLElement | null>) => () => void;
  onChange: (params: PerformanceObserved) => void;
  children?: ReactNode | undefined;
};

export const PerformanceMetricsObserver = <T,>({
  onChange,
  onRender,
  data,
  children,
}: Props<T>) => {
  /**
   * This is a ref to our temporary dom element
   * The actual element we need to track is the sibling of this element
   * and since sometimes, the sibling is simply a loader which is
   * replaced with a div with actual content, we will track the parent of
   * the sibling
   */
  const contentRef = useRef<HTMLDivElement>(null);

  /**
   * [Performance-Tracker]
   * This needs to be run only on the first load of the component so we can attach our DOM observer.
   */
  useEffect(() => {
    const parentElement = contentRef.current?.previousSibling?.parentElement;
    const elementToWatch = {
      current: parentElement,
    } as MutableRefObject<HTMLElement | null>;
    const onRenderCleanup = onRender?.(elementToWatch);
    PerfMetrics?.observeDom(elementToWatch, (mutations: MutationRecord[]) => {
      onChange({ mutations, data });
    });
    return () => {
      onRenderCleanup?.();
    };
  }, []);

  useEffect(() => {
    onChange({ mutations: undefined, data });
  }, [data]);

  return (
    <>
      {children}
      <span ref={contentRef} data-testid="performance-observer" />
    </>
  );
};
