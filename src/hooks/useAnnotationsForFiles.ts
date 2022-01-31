import { useEffect, useState } from 'react';
import uniqBy from 'lodash/uniqBy';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import {
  getIdFilter,
  getExternalIdFilter,
  convertEventsToAnnotations,
  CogniteAnnotation,
} from '@cognite/annotations';
import sdk from '@cognite/cdf-sdk-singleton';

export type FileWithAnnotations = FileInfo & {
  annotations: CogniteAnnotation[];
};

type AnnotationsForFiles = {
  annotations: { [id: number]: CogniteAnnotation[] };
  files: FileWithAnnotations[];
  isFetchingAnnotations: boolean;
  isFetchingFiles: boolean;
  isFetched: boolean;
};

export const useAnnotationsForFiles = (
  fileIds: number[]
): AnnotationsForFiles => {
  const mappedFileIds = [...fileIds.map((id) => ({ id }))];

  const [isFetchingAnnotations, setIsFetchingAnnotations] =
    useState<boolean>(false);
  const [annotationsFetched, setAnnotationsFetched] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<{
    [id: number]: CogniteAnnotation[];
  }>({});
  const { data: files, isFetched: filesFetched } = useCdfItems<FileInfo>(
    'files',
    mappedFileIds
  );

  const fetchEventsForFile = async (
    fileId: number,
    fileExternalId?: string
  ): Promise<{ [fileId: number]: CogniteAnnotation[] }> => {
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

    return { ...annotations, [fileId]: allEvents };
  };

  const getAnnotationsForFiles = async () => {
    let fixedAnnotations: { [fileId: number]: CogniteAnnotation[] } = {};
    if (!files) return;
    setIsFetchingAnnotations(true);
    await Promise.all(
      files.map(async (file) => {
        const newAnnotations = await fetchEventsForFile(
          file.id,
          file.externalId
        );
        fixedAnnotations = { ...fixedAnnotations, ...newAnnotations };
        return file;
      })
    );
    setIsFetchingAnnotations(false);
    setAnnotationsFetched(true);
    setAnnotations(fixedAnnotations);
  };

  useEffect(() => {
    if (filesFetched && files) {
      setAnnotationsFetched(false);
      getAnnotationsForFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesFetched, files]);

  return {
    annotations,
    files: (files ?? []).map((file) => ({
      ...file,
      annotations: annotations[file.id],
    })),
    isFetchingAnnotations,
    isFetchingFiles: filesFetched,
    isFetched: filesFetched && annotationsFetched,
  };
};
