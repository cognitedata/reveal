import { useEffect, useState } from 'react';
import uniqBy from 'lodash/uniqBy';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import {
  getIdFilter,
  getExternalIdFilter,
  convertEventsToAnnotations,
} from '@cognite/annotations';
import sdk from '@cognite/cdf-sdk-singleton';
import {
  getTaggedAnnotationFromAnnotationsApiAnnotation,
  getTaggedAnnotationFromEventAnnotation,
  TaggedAnnotation,
} from '../modules/workflows';
import { listAnnotationsForFileFromAnnotationsApi } from 'utils/AnnotationUtils';

export type FileWithAnnotations = FileInfo & {
  annotations: TaggedAnnotation[];
};

type AnnotationsForFiles = {
  annotations: { [id: number]: TaggedAnnotation[] };
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
    [id: number]: TaggedAnnotation[];
  }>({});
  const { data: files, isFetched: filesFetched } = useCdfItems<FileInfo>(
    'files',
    mappedFileIds
  );

  const fetchEventsForFile = async (
    fileId: number,
    fileExternalId?: string
  ): Promise<{ [fileId: number]: TaggedAnnotation[] }> => {
    const eventsById = await sdk.events
      .list({ filter: getIdFilter(fileId) })
      .autoPagingToArray({ limit: -1 });

    const eventsByExternalId = fileExternalId
      ? await sdk.events
          .list({ filter: getExternalIdFilter(fileExternalId) })
          .autoPagingToArray({ limit: -1 })
      : [];

    const eventAnnotations = convertEventsToAnnotations(
      uniqBy([...eventsById, ...eventsByExternalId], (el) => el.id)
    ).filter((annotation) => annotation.status !== 'deleted');

    // Note: We only check for annotations by the file internal id since it's always set
    // and it's always set on all of the annotations in the Annotations API. Not sure if the
    // same holds for the old events API annotations.
    const annotationsApiAnnotations =
      await listAnnotationsForFileFromAnnotationsApi(sdk, fileId);

    return {
      ...annotations,
      [fileId]: [
        ...eventAnnotations.map(getTaggedAnnotationFromEventAnnotation),
        ...annotationsApiAnnotations.map(
          getTaggedAnnotationFromAnnotationsApiAnnotation
        ),
      ],
    };
  };

  const getAnnotationsForFiles = async () => {
    let fixedAnnotations: { [fileId: number]: TaggedAnnotation[] } = {};
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
