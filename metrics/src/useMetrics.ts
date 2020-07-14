import { useState } from 'react';

import Metrics from './metrics';
import { Properties } from './types';

export default (componentName: string, props?: Properties) => {
  const [metrics] = useState(() => Metrics.create(componentName, props));
  return metrics;
};
