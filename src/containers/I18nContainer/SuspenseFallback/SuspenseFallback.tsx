import { useEffect } from 'react';
import { useMetrics, Metrics } from '@cognite/metrics';

const SuspenseFallback = () => {
  const metrics = useMetrics('SuspenseFallback', {
    usingLocize: !!process.env.REACT_APP_LOCIZE_PROJECT_ID,
  });
  useEffect(() => {
    const timer = metrics.start('suspense');
    return () => {
      Metrics.stop(timer);
    };
  }, [metrics]);
  return null;
};

export default SuspenseFallback;
