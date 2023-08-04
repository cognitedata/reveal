import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ExternalId } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { deleteScheduledCalculation } from '../network/deleteScheduledCalculation';

export const useScheduledCalculationTaskDeleteMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (externalIds: ExternalId[]) => {
      return deleteScheduledCalculation({ items: externalIds }, sdk);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['scheduled-calculations']);
      },
    }
  );
};
