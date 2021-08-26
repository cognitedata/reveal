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

export type FileWithAnnotations = FileInfo & {
  annotations: CogniteAnnotation[];
};

export const useFileWithAnnotations = (
  files: FileInfo[]
): { files: FileWithAnnotations[]; isFetching: boolean } => {
  const [annotations, setAnnotations] = useState<{
    [id: number]: CogniteAnnotation[];
  }>({});
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const fetchEventsForFile = async (
    fileId: number,
    fileExternalId?: string
  ) => {
    const eventsByFileId = await sdk.events
      .list({ filter: getIdFilter(fileId) })
      .autoPagingToArray({ limit: -1 });

    const eventsByFileExternalId = fileExternalId
      ? await sdk.events
          .list({ filter: getExternalIdFilter(fileExternalId) })
          .autoPagingToArray({ limit: -1 })
      : [];

    const allEvents = convertEventsToAnnotations(
      uniqBy([...eventsByFileId, ...eventsByFileExternalId], (el) => el.id)
    ).filter((annotation) => annotation.status !== 'deleted');

    setAnnotations((allAnnotations) => ({
      ...allAnnotations,
      [fileId]: allEvents ?? [],
    }));
  };

  useEffect(() => {
    const getAnnotationsForFiles = async (fetchedFiles: FileInfo[]) => {
      await Promise.all(
        fetchedFiles.map((file) =>
          fetchEventsForFile(file.id, file?.externalId)
        )
      );
    };
    if (files) {
      getAnnotationsForFiles(files).then(() => setIsFetching(false));
    }
  }, [files]);

  return {
    files: files.map((file) => ({
      ...file,
      annotations: annotations[file.id],
    })),
    isFetching,
  };
};
