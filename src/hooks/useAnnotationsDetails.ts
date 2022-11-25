import sdk from '@cognite/cdf-sdk-singleton';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import uniqBy from 'lodash/uniqBy';
import {
  getIdFilter,
  getExternalIdFilter,
  convertEventsToAnnotations,
} from '@cognite/annotations';
import { useCdfItems, useList } from '@cognite/sdk-react-query-hooks';
import { FileInfo, CogniteEvent } from '@cognite/sdk';
import { useInterval } from 'hooks';
import {
  getTaggedAnnotationFromAnnotationsApiAnnotation,
  getTaggedAnnotationFromEventAnnotation,
  isTaggedEventAnnotation,
  TaggedAnnotation,
} from '../modules/workflows';
import { listAnnotationsForFileFromAnnotationsApi } from 'utils/AnnotationUtils';

const TIMES_TO_REFETCH = 3;

export const useAnnotationsDetails = (fileId: number, refetch?: boolean) => {
  const client = useQueryClient();
  const [refetchTime, setRefetchTime] = useState(TIMES_TO_REFETCH);
  const [assetTags, setAssetTags] = useState<TaggedAnnotation[]>([]);
  const [fileTags, setFileTags] = useState<TaggedAnnotation[]>([]);
  const [pendingAssetTags, setPendingAssetTags] = useState<TaggedAnnotation[]>(
    []
  );
  const [pendingFileTags, setPendingFileTags] = useState<TaggedAnnotation[]>(
    []
  );
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<{
    [id: number]: TaggedAnnotation[];
  }>({});
  const [fileIdFilter, setFileIdFilter] = useState<any>();
  const [fileExternalIdFilter, setFileExternalIdFilter] = useState<any>();

  const { data: file, isFetched: isFileFetched } = useCdfItems<FileInfo>(
    'files',
    [{ id: fileId }]
  );

  useEffect(() => {
    setFileIdFilter(getIdFilter(fileId));
    if (file?.[0]?.externalId)
      setFileExternalIdFilter(getExternalIdFilter(file[0].externalId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const { data: eventsById, isFetched: isEventsByIdFetched } =
    useList<CogniteEvent>(
      'events',
      { filter: fileIdFilter, limit: 1000 },
      { enabled: isFileFetched && !!fileIdFilter }
    );
  const { data: eventsByExternalId, isFetched: isEventsByExternalIdFetched } =
    useList<CogniteEvent>(
      'events',
      { filter: fileExternalIdFilter, limit: 1000 },
      { enabled: isFileFetched && !!fileExternalIdFilter }
    );

  const { data: annotationsById, isFetched: isAnnotationsByIdFetched } =
    useQuery(
      `annotations-file-${fileId}`,
      () => listAnnotationsForFileFromAnnotationsApi(sdk, fileId),
      { enabled: isFileFetched }
    );

  const refetchAnnotations = () => {
    if (refetchTime <= 0) return;
    client.resetQueries(['sdk-react-query-hooks', 'cdf', 'events', 'list']);
    client.resetQueries(`annotations-file-${fileId}`);
    setRefetchTime(refetchTime - 1);
  };

  const setTags = () => {
    const newAssetTags =
      annotations[fileId]?.filter((taggedAnnotation) => {
        if (isTaggedEventAnnotation(taggedAnnotation)) {
          return (
            taggedAnnotation.annotation.resourceType === 'asset' &&
            taggedAnnotation.annotation.id &&
            taggedAnnotation.annotation.status !== 'deleted'
          );
        }

        return (
          taggedAnnotation.annotation.annotationType === 'diagrams.AssetLink' &&
          taggedAnnotation.annotation.status !== 'rejected'
        );
      }) ?? [];
    const newFileTags =
      annotations[fileId]?.filter((taggedAnnotation) => {
        if (isTaggedEventAnnotation(taggedAnnotation)) {
          return (
            taggedAnnotation.annotation.resourceType === 'file' &&
            taggedAnnotation.annotation.id &&
            taggedAnnotation.annotation.status !== 'deleted'
          );
        }

        return (
          taggedAnnotation.annotation.annotationType === 'diagrams.FileLink' &&
          taggedAnnotation.annotation.status !== 'rejected'
        );
      }) ?? [];
    const newPendingAssetTags =
      newAssetTags?.filter((taggedAnnotation) => {
        if (isTaggedEventAnnotation(taggedAnnotation)) {
          return (
            taggedAnnotation.annotation.id &&
            taggedAnnotation.annotation.status === 'unhandled'
          );
        }

        return taggedAnnotation.annotation.status === 'suggested';
      }) ?? [];
    const newPendingFileTags =
      newFileTags?.filter((taggedAnnotation) => {
        if (isTaggedEventAnnotation(taggedAnnotation)) {
          return (
            taggedAnnotation.annotation.id &&
            taggedAnnotation.annotation.status === 'unhandled'
          );
        }

        return taggedAnnotation.annotation.status === 'suggested';
      }) ?? [];

    setAssetTags(newAssetTags);
    setFileTags(newFileTags);
    setPendingAssetTags(newPendingAssetTags);
    setPendingFileTags(newPendingFileTags);
  };

  const getAnnotationsForFile = async () => {
    const uniqueAnnotations = uniqBy(
      [...(eventsById ?? []), ...(eventsByExternalId ?? [])],
      (el) => el.id
    );

    const newAnnotations = [
      ...convertEventsToAnnotations(uniqueAnnotations)
        .filter((annotation) => annotation.status !== 'deleted')
        .map(getTaggedAnnotationFromEventAnnotation),
      ...(annotationsById ?? []).map(
        getTaggedAnnotationFromAnnotationsApiAnnotation
      ),
    ];

    setAnnotations({ ...annotations, [fileId]: newAnnotations });
    setIsFetched(true);
  };

  useEffect(() => {
    setTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]);

  useEffect(() => {
    if (
      isFileFetched &&
      (isEventsByIdFetched ||
        isEventsByExternalIdFetched ||
        isAnnotationsByIdFetched)
    ) {
      getAnnotationsForFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFileFetched,
    annotationsById,
    eventsById,
    eventsByExternalId,
    isEventsByIdFetched,
    isEventsByExternalIdFetched,
    isAnnotationsByIdFetched,
  ]);

  useInterval(refetchAnnotations, refetch && refetchTime > 0 ? 5000 : null);

  return {
    annotations,
    assetTags,
    fileTags,
    pendingAssetTags,
    pendingFileTags,
    isFetched,
  };
};
