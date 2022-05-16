import { CogniteClient, CogniteEvent, IdEither } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';
import { useQuery } from 'react-query';

const next = async (client: CogniteClient, metadata: any = {}, cursor = '') => {
  const response = await client.events.list({
    filter: {
      type: 'cognite_annotation',
      metadata: {
        ...metadata,
      },
    },
    cursor,
  });
  return response;
};

const retrieveAllAnnotationEvents = async (
  client: CogniteClient,
  idEither: IdEither
) => {
  const { id, externalId } = idEither as any;

  let result: CogniteEvent[] = [];

  let metadata = {};

  if (id) {
    metadata = {
      CDF_ANNOTATION_file_id: String(id),
    };
  } else if (externalId) {
    metadata = {
      CDF_ANNOTATION_file_external_id: externalId || '',
    };
  }

  let { items, nextCursor } = await next(client, metadata);
  result = result.concat(items);

  while (nextCursor) {
    // eslint-disable-next-line no-await-in-loop
    ({ items, nextCursor } = await next(client, metadata, nextCursor));
    result = result.concat(items);
  }

  return result;
};

const useAnnotationEventsByIdQuery = (id: IdEither) => {
  const { client } = useCDFExplorerContext();

  const query = useQuery<CogniteEvent[]>(
    ['annotationEventsById', id],
    () => retrieveAllAnnotationEvents(client, id),
    {
      enabled: Boolean(id),
    }
  );
  return query;
};

export default useAnnotationEventsByIdQuery;
