import * as React from 'react';

import { MapEvent } from '../types';

import { useTouchedEvent } from './useTouchedEvent';
import { getDrawEvents } from './getDrawEvents';
import { EventSetters } from './useLayerEvents';

export const useDefaultEvents = (props: EventSetters): MapEvent[] => {
  const { touchedEvent } = useTouchedEvent();

  const memoizedDrawEvents = React.useMemo(() => getDrawEvents(props), [props]);

  return [...touchedEvent, ...memoizedDrawEvents];
};
