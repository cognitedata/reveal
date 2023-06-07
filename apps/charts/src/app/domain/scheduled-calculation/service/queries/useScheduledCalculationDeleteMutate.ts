import { ExternalId } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteScheduledCalculation } from '../network/deleteScheduledCalculation';

export const useScheduledCalculationDeleteMutate = () => {
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
