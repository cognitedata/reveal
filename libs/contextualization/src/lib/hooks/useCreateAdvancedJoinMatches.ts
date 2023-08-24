import { useMutation } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { MatchItem } from '../types';

export const useCreateAdvancedJoinMatches = () => {
  const sdk = useSDK();

  return useMutation(async (items: MatchItem[]) => {
    const response = await sdk.post(
      `/api/v1/projects/${sdk.project}/advancedjoins/matches`,
      {
        headers: {
          'cdf-version': 'alpha',
          'Content-Type': 'application/json',
        },
        data: {
          items: items,
        },
      }
    );

    return response.data;
  });
};
