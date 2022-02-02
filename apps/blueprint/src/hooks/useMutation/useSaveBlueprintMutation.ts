import { useContext } from 'react';
import { AuthContext } from 'providers/AuthProvider';
import { useMutation } from 'react-query';
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
    }
  );
};

export default useSaveBlueprintMutation;
