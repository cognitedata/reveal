import { useCallback } from 'react';

import {
  getUrlParameters,
  useCreateAdvancedJoinMatches,
} from '@fusion/contextualization';

import { ManualMatch } from '../types';
import { createMatchesRequestBody } from '../utils/createMatchesRequestBody';

export const useCreateAdvancedJoinMatchesWrapper = () => {
  const { mutate } = useCreateAdvancedJoinMatches();
  const { advancedJoinExternalId } = getUrlParameters();
  const createJoins = useCallback(
    (manualMatches: { [key: string]: ManualMatch }) => {
      const convertedItems = createMatchesRequestBody(
        manualMatches,
        advancedJoinExternalId
      );
      mutate(convertedItems);
    },
    [advancedJoinExternalId, mutate]
  );

  return createJoins;
};
