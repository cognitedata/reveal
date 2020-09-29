import { useState } from 'react';
import Metrics, { Properties } from '@cognite/metrics';

export default (componentName: string, props?: Properties) => {
  const [metrics] = useState(() => Metrics.create(componentName, props));
  return metrics;
};
