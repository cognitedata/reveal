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
  const { data: files, isFetched: filesFetched } = useCdfItems<FileInfo>(
    'files',
    [...fileIds.map((id) => ({ id }))]
  );
  const [annotations, setAnnotations] = useState<{
    [id: number]: CogniteAnnotation[];
  }>({});

  useEffect(() => {
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
      );

      setAnnotations({ ...annotations, [fileId]: allEvents });
    };

    const getAnnotationsForFiles = async (fetchedFiles: FileInfo[]) => {
      await Promise.all(
        fetchedFiles.map((file) => fetchEventsForFile(file.id, file.externalId))
      );
    };
    if (filesFetched && files) {
      getAnnotationsForFiles(files);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, filesFetched]);

  return annotations;
};
