import { CogniteClient } from '@cognite/sdk';
import { useQuery } from 'react-query';

export const usePowerOpsConfiguration = (client: CogniteClient | undefined) => {
  return useQuery(
    [`${client?.project}_configurations`],
    () =>
      client?.assets
        .retrieve([{ externalId: 'configurations' }])
        .then((assets) => assets[0]?.metadata ?? {}),
    {
      enabled: !!client,
      staleTime: 1000 * 30, // every 30 seconds
    }
  );
};
