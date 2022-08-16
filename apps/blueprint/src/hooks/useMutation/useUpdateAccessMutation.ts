import { useContext } from 'react';
import { AuthContext } from 'providers/AuthProvider';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import { useListBlueprintsName } from 'hooks/useQuery/useListBlueprintsQuery';
import { BlueprintReference } from 'typings';
import { toast } from '@cognite/cogs.js';

export const useUpdateAccessMutation = (
  options: UseMutationOptions<boolean, Error, BlueprintReference>
) => {
  const { blueprintService } = useContext(AuthContext);
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, BlueprintReference>(
    async ({ externalId, accessRights, accessType }) => {
      if (!blueprintService) {
        throw new Error('Failed, try again');
      }

      await blueprintService.updateAccess(externalId, accessRights, accessType);
      return true;
    },
    {
      onSuccess: async (...params) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(useListBlueprintsName);
        await queryClient.refetchQueries(useListBlueprintsName);
        if (options.onSuccess) {
          options.onSuccess(...params);
        }
      },
      onError: () => {
        toast.error('Failed to update access.');
      },
    }
  );
};

export default useUpdateAccessMutation;
