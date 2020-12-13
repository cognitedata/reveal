import { useCdfItem, useList } from '@cognite/sdk-react-query-hooks';
import { FileInfo, CogniteEvent } from '@cognite/sdk';
import {
  getIdFilter,
  getExternalIdFilter,
  convertEventsToAnnotations,
} from '@cognite/annotations';
import uniqBy from 'lodash/uniqBy';

export const useAnnotations = (fileId: number) => {
  const { data: file, isFetched: fileFetched } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });
  const { data: eventsById = [] } = useList<CogniteEvent>(
    'events',
    {
      limit: 1000,
      filter: getIdFilter(file?.id!),
    },
    { enabled: fileFetched && file && file?.id }
  );
  const { data: eventsByExternalId = [] } = useList<CogniteEvent>(
    'events',
    {
      limit: 1000,
      filter: getExternalIdFilter(file?.externalId!),
    },
    { enabled: fileFetched && file && !!file?.externalId }
  );

  return convertEventsToAnnotations(
    uniqBy([...eventsById, ...eventsByExternalId], el => el.id)
  );
};
