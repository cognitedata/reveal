import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useQuery } from 'react-query';

export const useFetchPowerOpsConfiguration = () => {
  const { client } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [client.project, 'configurations'],
    queryFn: () =>
      client.assets
        .retrieve([{ externalId: 'configurations' }])
        .then((assets) => assets[0]?.metadata ?? {}),
    staleTime: 1000 * 30,
  });
};
