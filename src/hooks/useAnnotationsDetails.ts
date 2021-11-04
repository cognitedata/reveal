import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import uniqBy from 'lodash/uniqBy';
import {
  getIdFilter,
  getExternalIdFilter,
  convertEventsToAnnotations,
  CogniteAnnotation,
} from '@cognite/annotations';
import { useCdfItems, useList } from '@cognite/sdk-react-query-hooks';
import { FileInfo, CogniteEvent } from '@cognite/sdk';
import { useInterval } from 'hooks';

const TIMES_TO_REFETCH = 3;

export const useAnnotationsDetails = (fileId: number, refetch?: boolean) => {
  const client = useQueryClient();
  const [refetchTime, setRefetchTime] = useState(TIMES_TO_REFETCH);
  const [assetTags, setAssetTags] = useState<CogniteAnnotation[]>([]);
  const [fileTags, setFileTags] = useState<CogniteAnnotation[]>([]);
  const [pendingAssetTags, setPendingAssetTags] = useState<CogniteAnnotation[]>(
    []
  );
  const [pendingFileTags, setPendingFileTags] = useState<CogniteAnnotation[]>(
    []
  );
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<{
    [id: number]: CogniteAnnotation[];
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

  const refetchAnnotations = () => {
    if (refetchTime <= 0) return;
    client.resetQueries(['sdk-react-query-hooks', 'cdf', 'events', 'list']);
    setRefetchTime(refetchTime - 1);
  };

  const setTags = () => {
    const newAssetTags =
      annotations[fileId]?.filter(
        (an) => an.resourceType === 'asset' && an.id && an.status !== 'deleted'
      ) ?? [];
    const newFileTags =
      annotations[fileId]?.filter(
        (an) => an.resourceType === 'file' && an.id && an.status !== 'deleted'
      ) ?? [];
    const newPendingAssetTags =
      newAssetTags?.filter((an) => an.id && an.status === 'unhandled') ?? [];
    const newPendingFileTags =
      newFileTags?.filter((an) => an.id && an.status === 'unhandled') ?? [];

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
    const newAnnotations = convertEventsToAnnotations(uniqueAnnotations).filter(
      (annotation) => annotation.status !== 'deleted'
    );
    setAnnotations({ ...annotations, [fileId]: newAnnotations });
    setIsFetched(true);
  };

  useEffect(() => {
    setTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]);

  useEffect(() => {
    if (isFileFetched && (isEventsByIdFetched || isEventsByExternalIdFetched)) {
      getAnnotationsForFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFileFetched,
    eventsById,
    eventsByExternalId,
    isEventsByIdFetched,
    isEventsByExternalIdFetched,
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
