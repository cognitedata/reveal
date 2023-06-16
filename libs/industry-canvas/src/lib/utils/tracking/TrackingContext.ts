import { createContext } from 'react';

import { TrackUsageFn } from './createTrackUsage';

const TrackingContext = createContext<TrackUsageFn | undefined>(undefined);

export default TrackingContext;
