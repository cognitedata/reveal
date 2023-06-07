import { JourneyItem } from '@data-exploration-lib/core';

import { useJourney } from './useJourney';

// Returns first and last item in the journey.
export const useGetJourney = (): [
  JourneyItem | undefined,
  JourneyItem | undefined
] => {
  const [journey] = useJourney();
  const firstItem = journey?.[0];
  const journeyLength = Number(journey?.length);
  const lastItem = journeyLength > 0 ? journey?.[journeyLength - 1] : undefined;

  return [firstItem, lastItem];
};
