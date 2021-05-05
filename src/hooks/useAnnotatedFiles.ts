import { useEffect, useState } from 'react';
import contextServiceApi from 'api/contextService';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

export const useAnnotatedFiles = (shouldUpdate: boolean) => {
  const [fileIds, setFileIds] = useState<Array<{ id: number }>>([]);
  const [fetchedFileIds, setFetchedFileIds] = useState<boolean>(false);

  useEffect(() => {
    const fetchFileIds = async () => {
      const ids = (await contextServiceApi.getAnnotatedFiles()) ?? [];
      setFileIds(ids.map((item) => ({ id: Number(item) })));
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
    fileIds,
    true
  );

  const isLoading = !fetchedFileIds || !filesFetched;

  return { fileIds, isLoading, files };
};
