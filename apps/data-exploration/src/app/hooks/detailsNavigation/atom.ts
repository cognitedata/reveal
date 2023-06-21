import { atom, useRecoilState } from 'recoil';

import { JourneyItem } from '@data-exploration-lib/core';

export const breakJourneyPrompt = atom<{
  isOpen: boolean;
  journey?: JourneyItem;
}>({
  key: 'BreakJourneyPrompt',
  default: {
    isOpen: false,
  },
});
export const useBreakJourneyState = () => useRecoilState(breakJourneyPrompt);
