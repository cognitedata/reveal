import { JourneyItem } from '@data-exploration-lib/core';

import { useBreakJourneyState } from './atom';

export const useBreakJourneyPromptState = (): [
  { isOpen: boolean; journey?: JourneyItem },
  (isPromptOpen: boolean, item?: JourneyItem) => void
] => {
  const [state, setBreakJourney] = useBreakJourneyState();

  const setBreakJourneyPromptOpen = (
    isModalOpen: boolean,
    item?: JourneyItem
  ) => {
    setBreakJourney({
      isOpen: isModalOpen,
      journey: item,
    });
  };

  return [state, setBreakJourneyPromptOpen];
};
