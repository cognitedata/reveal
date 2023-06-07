import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { Journey, JourneyItem } from '@data-exploration-lib/core';

import { useJourney } from './useJourney';

// Removes the last item from journey array.
export const usePopJourney = (): [Journey, () => JourneyItem | undefined] => {
  const location = useLocation();
  const [journey, setJourneySearchParam] = useJourney();
  const popJourney = useCallback(() => {
    const lastItem = journey?.pop();
    if (lastItem !== undefined) {
      setJourneySearchParam(journey);
    }

    return lastItem;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return [journey, popJourney];
};
