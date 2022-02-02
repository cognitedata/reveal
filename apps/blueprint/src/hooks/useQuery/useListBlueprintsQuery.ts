import { AuthContext } from 'providers/AuthProvider';
import { useContext } from 'react';
import { useQuery } from 'react-query';
import { BlueprintReference } from 'typings';

export const useListBlueprintsName = 'listBlueprints';

const useListBlueprints = () => {
  const { blueprintService } = useContext(AuthContext);

  const query = useQuery<BlueprintReference[]>(
    [useListBlueprintsName],
    () => blueprintService!.list(),
    {
      enabled: true,
      refetchOnMount: 'always',
    }
  );

  return query;
};

export default useListBlueprints;
