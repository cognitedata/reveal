import { useEffect, useState } from 'react';
import contextServiceApi from 'api/contextService';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { FileInfo, IdEither } from 'cognite-sdk-v3';
import chunk from 'lodash/chunk';
import uniq from 'lodash/uniq';

export const useAnnotatedFiles = (shouldUpdate: boolean, loadChunk: number) => {
  const [fileIds, setFileIds] = useState<Array<IdEither>>([]);
  const [fetchedFileIds, setFetchedFileIds] = useState<boolean>(false);
  const [fileIdsChunks, setFileIdsChunks] = useState<Array<IdEither[]>>([]);
  const [files, setFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    const fetchFileIds = async () => {
      const ids = (await contextServiceApi.getAnnotatedFiles()) ?? [];
      setFileIds(ids);
      setFileIdsChunks(chunk(ids, 1000));
      setFetchedFileIds(true);
    };
    if (!fetchedFileIds) {
      fetchFileIds();
    }
  }, [fetchedFileIds]);

  // Trigger previous effect to fetch fileIds again
  useEffect(() => {
    if (shouldUpdate) {
      setFetchedFileIds(false);
    }
  }, [shouldUpdate]);

  const {
    data: currentFilesChunk,
    isFetched: filesFetched,
  } = useCdfItems<FileInfo>(
    'files',
    fileIdsChunks.length && fileIdsChunks[loadChunk]
      ? fileIdsChunks[loadChunk]
      : [],
    true
  );

  useEffect(() => {
    if (currentFilesChunk?.length) {
      const newTotal = uniq<FileInfo>([
        ...files,
        ...currentFilesChunk,
      ]) as FileInfo[];
      setFiles(newTotal);
    }

    // Adding "files" here will cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilesChunk]);

  const isLoading = !fetchedFileIds || !filesFetched;

  return { isLoading, files, total: fileIds.length };
};
