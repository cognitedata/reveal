import React from 'react';

import { TrackUsageFn } from './createTrackUsage';
import TrackerContext from './TrackingContext';

type TrackingContextProviderProps = {
  trackUsage: TrackUsageFn;
  children: React.ReactNode;
};

const TrackingContextProvider: React.FC<TrackingContextProviderProps> = ({
  trackUsage,
  children,
}) => {
  return (
    <TrackerContext.Provider value={trackUsage}>
      {children}
    </TrackerContext.Provider>
  );
};

export default TrackingContextProvider;
