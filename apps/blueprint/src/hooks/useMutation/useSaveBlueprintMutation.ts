import { useContext } from 'react';
import { AuthContext } from 'providers/AuthProvider';
import { useMutation } from '@tanstack/react-query';
import { BlueprintDefinition } from 'typings';
import { toast } from '@cognite/cogs.js';

const useSaveBlueprintMutation = () => {
  const { blueprintService } = useContext(AuthContext);

  return useMutation(
    async (nextBlueprint: BlueprintDefinition) => {
      return blueprintService!.save(nextBlueprint);
    },
    {
      onSuccess: async () => {
        toast.success('Saved blueprint.');
      },
      onError: () => {
        toast.error('You do not have permission to save blueprints.');
      },
    }
  );
};

export default useSaveBlueprintMutation;
