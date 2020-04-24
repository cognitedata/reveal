import { useEffect } from 'react';
import useMetrics from 'useMetrics';
import Metrics from '@cognite/metrics';

const SuspenseFallback = () => {
  const metrics = useMetrics('I18nSuspense');

  useEffect(() => {
    const timer = metrics.start('suspended');
    return () => {
      Metrics.stop(timer);
    };
  }, [metrics]);
  return null;
};

export default SuspenseFallback;
