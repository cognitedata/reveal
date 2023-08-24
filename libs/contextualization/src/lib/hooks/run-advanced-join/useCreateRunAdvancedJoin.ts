import { useMutation } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useCreateRunAdvancedJoin = () => {
  const sdk = useSDK();

  return useMutation(async (advancedJoinExternalId: string) => {
    const response = await sdk.post(
      `/api/v1/projects/${sdk.project}/advancedjoins/run`,
      {
        headers: {
          'cdf-version': 'alpha',
          'Content-Type': 'application/json',
        },
        data: {
          advancedJoinExternalId: advancedJoinExternalId,
        },
      }
    );
    return response.data;
  });
};
