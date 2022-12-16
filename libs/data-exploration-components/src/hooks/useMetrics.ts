import { AppContext } from '@data-exploration-components/context/AppContext';
import { noop } from 'lodash';
import { useContext } from 'react';

export type MetricsMetadata = {
  [key: string]: any;
};

export const useMetrics = () => {
  const context = useContext(AppContext);
  const trackUsage = context?.trackUsage;

  if (!trackUsage) return noop;

  return trackUsage;
};
