import { PropsWithChildren, RefObject, useEffect, useRef } from 'react';

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
  const contentRef = useRef<HTMLDivElement>(null);

  // [Performance-Tracker] This needs to be run only on the first load of the component so we can attach our DOM observer
  useEffect(() => {
    const onRenderCleanup = onRender ? onRender(contentRef) : null;
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

  return <div ref={contentRef}>{children}</div>;
};
