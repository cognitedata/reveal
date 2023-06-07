import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { JourneyItem } from '@data-exploration-lib/core';

import { useJourney } from './useJourney';

// Adds a new item to the Journey array.
export const usePushJourney = (): [
  (item: JourneyItem, createNewJourney?: boolean) => void
] => {
  const location = useLocation();
  const [journey, setJourney] = useJourney();
  const pushJourney = useCallback(
    (item: JourneyItem, createNewJourney = false) => {
      // console.log('pushJourney; item: ', item);
      // If there isn't any journey before, initiate one...
      // ...or if `createNewJourney` flag is 'true' then initiate a new journey.
      if (journey === undefined || createNewJourney) {
        setJourney([item]);
      } else {
        journey.push(item);
        setJourney(journey);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  return [pushJourney];
};
