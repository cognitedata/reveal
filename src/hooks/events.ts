import { CogniteError, CogniteEvent, EventChange } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export const useUpdateEvents = (
  options?: UseMutationOptions<CogniteEvent[], CogniteError, EventChange[]>
) => {
  const sdk = useSDK();

  return useMutation(
    ['update', 'events'],
    (changes) => {
      return sdk.events.update(changes);
    },
    options
  );
};
