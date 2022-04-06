import { CogniteClient } from '@cognite/sdk';
import { useQuery } from 'react-query';

// const processStatuses: Record<string, string> = {
//   POWEROPS_SHOP_START: 'SHOP Started',
//   POWEROPS_SHOP_END: 'SHOP Finished',
//   POWEROPS_BID_MATRIX_CREATE: 'Creating Bid Matrix',
//   POWEROPS_BID_MATRIX_END: 'Bid Matrix Ready',
// };

// const updateProcessStatus = async (event: CogniteEvent): Promise<void> => {
//   if (!event || !event.externalId || !event.type) return;

//   const relationships = await client?.relationships.list({
//     filter: {
//       targetExternalIds: [event.externalId],
//       sourceTypes: ['event'],
//     },
//     limit: 1,
//   });
//   if (!relationships?.items?.[0]) return;

//   const sourceEvent = await client?.events.retrieve([
//     { externalId: relationships?.items?.[0].sourceExternalId },
//   ]);
//   if (!sourceEvent?.[0]) return;
//   console.log(sourceEvent);
// };

const fetchEvents = ({
  client,
  processType,
}: {
  client: CogniteClient;
  processType: string;
}) => {
  return client.events
    .list({
      filter: {
        externalIdPrefix: processType,
      },
      sort: {
        createdTime: 'desc',
      },
    })
    .autoPagingToArray({ limit: 20 })
    .then((items) => items);
};

export const fetchSingleEvent = ({
  client,
  externalId,
}: {
  client: CogniteClient;
  externalId: string;
}) => {
  return client.events.retrieve([{ externalId }]);
};

export const useFetchEvents = ({
  client,
  processType,
}: {
  client: CogniteClient;
  processType: string;
}) => {
  return useQuery({
    queryKey: processType,
    queryFn: () => fetchEvents({ client, processType }),
  });
};
