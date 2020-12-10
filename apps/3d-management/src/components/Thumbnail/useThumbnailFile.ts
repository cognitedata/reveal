import { v3, v3Client } from '@cognite/cdf-sdk-singleton';
import { fireErrorNotification } from 'src/utils';
import { useQuery, useQueryCache } from 'react-query';

async function fetchFile(_key, fileId: number): Promise<string> {
  const arraybuffers = await v3Client.files3D.retrieve(fileId);
  const arrayBufferView = new Uint8Array(arraybuffers);
  const blob = new Blob([arrayBufferView]);
  return window.URL.createObjectURL(blob);
}

export function useThumbnailFileQuery(fileId: number) {
  const queryKey = ['file', fileId];
  const queryCache = useQueryCache();
  return useQuery<string, v3.HttpError>({
    queryKey,
    queryFn: fetchFile,
    config: {
      staleTime: Infinity,
      initialData: () => queryCache.getQueryData(queryKey),
      refetchOnMount: false,
      onError: (error) =>
        fireErrorNotification({ error, message: 'Could not fetch thumbnail' }),
    },
  });
}
