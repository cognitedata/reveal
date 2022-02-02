import { useContext } from 'react';
import { AuthContext } from 'providers/AuthProvider';
import { useMutation, useQueryClient } from 'react-query';
import { useListBlueprintsName } from 'hooks/useQuery/useListBlueprintsQuery';
import { BlueprintReference } from 'typings';
import { useFetchBlueprintDefinitionName } from 'hooks/useQuery/useFetchBlueprintDefinitionQuery';

const useCreateBlueprintMutation = () => {
  const { blueprintService } = useContext(AuthContext);
  const queryClient = useQueryClient();

  return useMutation<BlueprintReference>(
    async () => {
      if (!blueprintService) {
        throw new Error('Failed, try again');
      }
      return blueprintService.save();
    },
    {
      onSuccess: async (newBlueprintRef: BlueprintReference) => {
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
            [...previousBlueprints, newBlueprintRef]
          );
        }

        queryClient.setQueryData(
          [useFetchBlueprintDefinitionName, newBlueprintRef.externalId],
          blueprintService?.makeEmptyBlueprint(newBlueprintRef.externalId)
        );

        return previousBlueprints;
      },
    }
  );
};

export default useCreateBlueprintMutation;
