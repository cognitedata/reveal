import { useCallback } from 'react';

import { useCreateAdvancedJoinMatches } from '@fusion/contextualization';

import { ManualMatch } from '../types';
import { createMatchesRequestBody } from '../utils/createMatchesRequestBody';

export const useCreateAdvancedJoinMatchesWrapper = (
  advancedJoinExternalId: string | undefined
) => {
  const { mutate } = useCreateAdvancedJoinMatches();
  const createMatches = useCallback(
    (manualMatches: { [key: string]: ManualMatch }) => {
      const convertedItems = createMatchesRequestBody(
        manualMatches,
        advancedJoinExternalId
      );
      mutate(convertedItems);
    },
    [advancedJoinExternalId, mutate]
  );

  return createMatches;
};
