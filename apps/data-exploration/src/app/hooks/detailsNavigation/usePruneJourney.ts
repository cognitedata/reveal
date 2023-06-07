import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { Journey } from '@data-exploration-lib/core';

import { useJourney } from './useJourney';

// Prunes the journey array from the given index (the item at the index is also removed).
export const usePruneJourney = (): [Journey, (pruneIndex: number) => void] => {
  const location = useLocation();
  const [journey, setJourneySearchParam] = useJourney();
  const pruneJourney = useCallback(
    (index: number) => {
      const journeyLength = Number(journey?.length);
      if (index + 1 <= journeyLength) {
        journey?.splice(index + 1);
        setJourneySearchParam(journey);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  return [journey, pruneJourney];
};
