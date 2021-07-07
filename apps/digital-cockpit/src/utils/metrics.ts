import { Metrics, useMetrics as useRealMetrics } from '@cognite/metrics';
import {
  Metrics as mockMetrics,
  useMetrics as useMockMetrics,
} from '@cognite/metrics/dist/mocks';
import sidecar from './sidecar';

export const getMetrics = () => {
  const { mixpanel } = sidecar;
  if (!mixpanel) {
    return mockMetrics;
  }
  return Metrics;
};
export type MetricsHookMock = {
  start: () => {
    stop: () => undefined;
  };
  track: () => undefined;
};

// eslint-disable no-any
export function useMetrics(
  componentName: string,
  props?: any
): Metrics | MetricsHookMock {
  const realMetricsHook = useRealMetrics(componentName, props);
  const mockMetricsHook = useMockMetrics();
  const { mixpanel } = sidecar;
  if (!mixpanel) {
    return mockMetricsHook;
  }
  return realMetricsHook;
}
