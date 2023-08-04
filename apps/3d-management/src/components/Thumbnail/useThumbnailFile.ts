import { useQuery, useQueryClient } from '@tanstack/react-query';

import { CogniteClient, HttpError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { fireErrorNotification } from '../../utils';

async function fetchFile(sdk: CogniteClient, fileId: number): Promise<string> {
  const arraybuffers = await sdk.files3D.retrieve(fileId);
  const arrayBufferView = new Uint8Array(arraybuffers);
  const blob = new Blob([arrayBufferView]);
  return window.URL.createObjectURL(blob);
}

export function useThumbnailFileQuery(fileId: number) {
  const queryKey = ['file', fileId];
  const queryClient = useQueryClient();
  const sdk = useSDK();

  return useQuery<string, HttpError>(queryKey, () => fetchFile(sdk, fileId), {
    staleTime: Infinity,
    initialData: () => queryClient.getQueryData(queryKey),
    refetchOnMount: false,
    onError: (error) =>
      fireErrorNotification({ error, message: 'Could not fetch thumbnail' }),
  });
}
