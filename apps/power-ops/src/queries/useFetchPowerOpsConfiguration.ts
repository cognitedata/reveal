import { PowerOpsConfigCDFModel } from '@cognite/power-ops-api-types';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useQuery } from '@tanstack/react-query';

export const useFetchPowerOpsConfiguration = () => {
  const { client } = useAuthenticatedAuthContext();
  return useQuery({
    queryKey: [client.project, 'configurations'],
    queryFn: () =>
      client.assets
        .retrieve([{ externalId: 'configurations' }])
        .then((list) => (list[0] as PowerOpsConfigCDFModel).metadata),
    staleTime: 1000 * 30,
  });
};
