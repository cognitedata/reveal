import { useEffect, useState } from 'react';
import contextServiceApi from 'api/contextService';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { IdEither } from 'cognite-sdk-v3';
import chunk from 'lodash/chunk';

export const useAnnotatedFiles = (shouldUpdate: boolean, page: number) => {
  const [fileIds, setFileIds] = useState<Array<IdEither>>([]);
  const [fetchedFileIds, setFetchedFileIds] = useState<boolean>(false);
  const [fileIdsChunks, setFileIdsChunks] = useState<Array<IdEither[]>>([]);

  useEffect(() => {
    const fetchFileIds = async () => {
      const ids = (await contextServiceApi.getAnnotatedFiles()) ?? [];
      setFileIds(ids);
      setFileIdsChunks(chunk(ids, 10));
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

  const { data: files, isFetched: filesFetched } = useCdfItems(
    'files',
    fileIdsChunks.length && fileIdsChunks[page] ? fileIdsChunks[page] : [],
    true
  );

  const isLoading = !fetchedFileIds || !filesFetched;

  return { isLoading, files, total: fileIds.length };
};
