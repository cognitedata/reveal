import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import {
  getIdFilter,
  getExternalIdFilter,
  convertEventsToAnnotations,
  CogniteAnnotation,
} from '@cognite/annotations';
import uniqBy from 'lodash/uniqBy';
import { useEffect, useState } from 'react';

import sdk from 'sdk-singleton';

export const useAnnotationsForFiles = (fileIds: number[]) => {
  const mappedFileIds = [...fileIds.map((id) => ({ id }))];

  const { data: files, isFetched: filesFetched } = useCdfItems<FileInfo>(
    'files',
    mappedFileIds
  );
  const [annotations, setAnnotations] = useState<{
    [id: number]: CogniteAnnotation[];
  }>({});
  const fetchEventsForFile = async (
    fileId: number,
    fileExternalId?: string
  ) => {
    const eventsById = await sdk.events
      .list({ filter: getIdFilter(fileId) })
      .autoPagingToArray({ limit: -1 });

    const eventsByExternalId = fileExternalId
      ? await sdk.events
          .list({ filter: getExternalIdFilter(fileExternalId) })
          .autoPagingToArray({ limit: -1 })
      : [];

    const allEvents = convertEventsToAnnotations(
      uniqBy([...eventsById, ...eventsByExternalId], (el) => el.id)
    ).filter((annotation) => annotation.status !== 'deleted');

    setAnnotations({ ...annotations, [fileId]: allEvents });
  };

  const getAnnotationsForFiles = async (fetchedFiles: FileInfo[]) => {
    await Promise.all(
      fetchedFiles.map((file) => fetchEventsForFile(file.id, file.externalId))
    );
  };

  useEffect(() => {
    if (filesFetched && files) {
      getAnnotationsForFiles(files);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, filesFetched]);

  return annotations;
};
