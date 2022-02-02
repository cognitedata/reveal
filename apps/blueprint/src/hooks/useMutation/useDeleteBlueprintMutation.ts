import { useContext } from 'react';
import { AuthContext } from 'providers/AuthProvider';
import { useMutation, useQueryClient } from 'react-query';
import { useListBlueprintsName } from 'hooks/useQuery/useListBlueprintsQuery';
import { BlueprintReference } from 'typings';

const useDeleteBlueprintMutation = () => {
  const { blueprintService } = useContext(AuthContext);
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      await blueprintService?.delete(id);
    },
    {
      onMutate: async (id: string) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(useListBlueprintsName);

        // Snapshot the previous value
        const previousBlueprints = queryClient.getQueryData<
          BlueprintReference[]
        >(useListBlueprintsName);

        // Optimistically update to the new value
        if (previousBlueprints) {
          queryClient.setQueryData<BlueprintReference[]>(
            useListBlueprintsName,
            previousBlueprints.filter((bp) => bp.externalId !== id)
          );
        }

        return previousBlueprints;
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (_, __, context) => {
        if (context) {
          queryClient.setQueryData<BlueprintReference[]>(
            useListBlueprintsName,
            context
          );
        }
      },
    }
  );
};

export default useDeleteBlueprintMutation;
