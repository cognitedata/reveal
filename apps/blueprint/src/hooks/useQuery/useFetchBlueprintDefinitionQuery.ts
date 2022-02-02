import { AuthContext } from 'providers/AuthProvider';
import { useContext } from 'react';
import { useQuery } from 'react-query';
import { BlueprintDefinition } from 'typings';

export const useFetchBlueprintDefinitionName = 'fetchBlueprintDefinition';

const useFetchBlueprintDefinition = (externalId: string) => {
  const { blueprintService } = useContext(AuthContext);

  const query = useQuery<BlueprintDefinition>(
    [useFetchBlueprintDefinitionName, externalId],
    () => blueprintService!.load(externalId),
    {
      enabled: !!externalId,
    }
  );

  return query;
};

export default useFetchBlueprintDefinition;
