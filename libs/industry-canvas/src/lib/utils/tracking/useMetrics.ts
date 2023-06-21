import { useContext } from 'react';

import { noop } from 'lodash';

import TrackingContext from './TrackingContext';

export const useMetrics = () => {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    console.warn('useMetrics must be used within a TrackingProvider');
    return noop;
  }
  return context;
};

export default useMetrics;
