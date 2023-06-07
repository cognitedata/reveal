import { useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import {
  BREAK_JOURNEY_FIELD,
  getJourneyItemFromString,
  getStringFromJourneyItem,
  JourneyItem,
} from '@data-exploration-lib/core';

export const useBreakJourneyPromptToggle = (): [
  JourneyItem | undefined,
  (isPromptOpen: boolean, item?: JourneyItem) => void
] => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const promptItemValue = searchParams.get(BREAK_JOURNEY_FIELD);
  const promptItem = promptItemValue
    ? getJourneyItemFromString(promptItemValue)
    : undefined;

  const setBreakJourneyPromptOpen = useCallback(
    (isModalOpen: boolean, item?: JourneyItem) => {
      // Using 'searchParams` from the 'useSearchParams' hook is not a viable option here.
      // https://github.com/remix-run/react-router/issues/9757
      const params = new URLSearchParams(window.location.search);

      if (isModalOpen && item) {
        params.set(BREAK_JOURNEY_FIELD, getStringFromJourneyItem(item));
      } else {
        params.delete(BREAK_JOURNEY_FIELD);
      }

      setSearchParams(() => {
        return params;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  return [promptItem, setBreakJourneyPromptOpen];
};
