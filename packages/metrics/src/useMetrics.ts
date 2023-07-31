import { useState } from 'react';

import Metrics from './metrics';
import { Properties } from './types';

const metricsContainer: { [key: string]: Metrics } = {};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (componentName?: string, props?: Properties) => {
  const [metrics] = useState(() => {
    const m = Metrics.create(componentName, props);
    const cName = componentName || '';
    if (cName in metricsContainer) {
      return metricsContainer[cName];
    }
    metricsContainer[cName] = m;
    return m;
  });
  return metrics;
};
