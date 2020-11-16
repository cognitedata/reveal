import { useState } from 'react';
import { Metrics, Properties, ITimer } from '@cognite/metrics';
import { Dict } from 'mixpanel-browser';

export type MetricsApi = {
  start: (name: string, properties?: Dict) => ITimer;
  track: (name: string, properties?: Dict) => void;
};

export default (componentName: string, props?: Properties) => {
  const [metrics] = useState<Metrics>(() =>
    Metrics.create(componentName, props)
  );

  return {
    start: metrics.start,
    track: (name: string, properties?: Dict) => {
      metrics.track(name, properties);
    },
  } as MetricsApi;
};
