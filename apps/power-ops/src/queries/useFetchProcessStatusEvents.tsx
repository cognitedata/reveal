import { CogniteClient } from '@cognite/sdk';
import { POWEROPS_LABELS } from '@cognite/power-ops-api-types';
import { useQuery } from 'react-query';

export const fetchProcessStatusEvents = async ({
  client,
  sourceExternalIds,
}: {
  client: CogniteClient | undefined;
  sourceExternalIds: string[] | undefined;
}): Promise<{
  [eventExternalId: string]: { statusEventExternalId: string };
}> => {
  if (!client || !sourceExternalIds?.length) {
    return {};
  }

  // Find all status events attached to all source processes based on their externalIds
  // Process (source) --> Status Event (target)
  const { items: statusRelationships } = await client.relationships.list({
    filter: {
      sourceExternalIds,
      targetTypes: ['event'],
      labels: {
        containsAny: [
          { externalId: POWEROPS_LABELS.STATUS_EVENT_STARTED_LABEL },
          { externalId: POWEROPS_LABELS.STATUS_EVENT_FINISHED_LABEL },
          { externalId: POWEROPS_LABELS.STATUS_EVENT_FAILED_LABEL },
        ],
      },
    },
    limit: 1000,
  });

  const sortedRelationshipsGroupedByEvent: {
    [eventExternalId: string]: { statusEventExternalId: string };
  } = {};

  // Sort by status event created time to always have the latests status of each process
  // and group them in a { key: value } dictionary of { processID: status }
  statusRelationships
    .sort((a, b) => (a.createdTime > b.createdTime ? -1 : 1))
    .forEach((rel) => {
      if (!sortedRelationshipsGroupedByEvent[rel.sourceExternalId]) {
        sortedRelationshipsGroupedByEvent[rel.sourceExternalId] = {
          statusEventExternalId: rel.targetExternalId,
        };
      }
    });

  // If a process doesnt have a status event attached to it, it means it is in a TRIGGERED status
  // but no worker has picked it up to START it.
  sourceExternalIds.forEach((id) => {
    if (!Object.keys(sortedRelationshipsGroupedByEvent).includes(id)) {
      sortedRelationshipsGroupedByEvent[id] = {
        statusEventExternalId: 'TRIGGERED',
      };
    }
  });

  return sortedRelationshipsGroupedByEvent;
};

export const useFetchProcessStatusEvents = ({
  client,
  sourceExternalIds,
}: {
  client: CogniteClient | undefined;
  sourceExternalIds: string[] | undefined;
}) => {
  return useQuery(
    [sourceExternalIds],
    () => fetchProcessStatusEvents({ client, sourceExternalIds }),
    {
      // The query will not execute until the sourceExternalIds array has elements
      enabled: !!sourceExternalIds?.length,
    }
  );
};
