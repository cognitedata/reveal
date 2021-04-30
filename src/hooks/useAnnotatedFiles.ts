import { useEffect, useState } from 'react';
import contextServiceApi from 'api/contextService';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

export const useAnnotatedFiles = () => {
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

  const { data: files, isFetched: filesFetched } = useCdfItems(
    'files',
    fileIds
  );

  const isLoading = !fetchedFileIds || !filesFetched;

  return { fileIds, isLoading, files };
};
