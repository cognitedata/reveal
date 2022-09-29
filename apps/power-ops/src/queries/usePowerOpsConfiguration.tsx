import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useQuery } from 'react-query';

export const usePowerOpsConfiguration = () => {
  const { client } = useAuthenticatedAuthContext();
  return useQuery(
    [client.project, 'configurations'],
    () =>
      client.assets
        .retrieve([{ externalId: 'configurations' }])
        .then((assets) => assets[0]?.metadata ?? {}),
    {
      staleTime: 1000 * 30, // every 30 seconds
    }
  );
};
