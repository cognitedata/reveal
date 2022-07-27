import { useQuery } from 'react-query';
import { Relationship, CogniteClient, ExternalId } from '@cognite/sdk';

const fetchEventRelationships = async ({
  client,
  labels,
  sourceExternalId,
}: {
  client: CogniteClient | undefined;
  labels: ExternalId[];
  sourceExternalId: string | undefined;
}): Promise<Relationship[]> => {
  return sourceExternalId && client
    ? client.relationships
        .list({
          filter: {
            sourceExternalIds: [sourceExternalId],
            targetTypes: ['event'],
            labels: {
              containsAny: labels,
            },
          },
          limit: 1000,
        })
        .then((response) => {
          return response.items;
        })
    : [];
};

export const useFetchEventRelationships = ({
  client,
  labels,
  sourceExternalId,
}: {
  client: CogniteClient | undefined;
  labels: ExternalId[];
  sourceExternalId: string | undefined;
}) => {
  return useQuery(
    [sourceExternalId],
    () => fetchEventRelationships({ client, labels, sourceExternalId }),
    {
      // The query will not execute until the sourceExternalId exists
      enabled: !!sourceExternalId,
    }
  );
};
