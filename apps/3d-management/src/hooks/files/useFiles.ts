import { useQuery } from '@tanstack/react-query';

import { CogniteClient, FileInfo, HttpError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { fireErrorNotification } from '../../utils';

const fetchFiles = ({
  sdk,
  fileIds,
}: {
  sdk: CogniteClient;
  fileIds: number[];
}): Promise<FileInfo[]> => {
  return sdk.files.retrieve(fileIds.map((id) => ({ id })));
};

export const useFiles = (fileIds: number[]) => {
  const sdk = useSDK();
  return useQuery<FileInfo[], HttpError>(
    [fileIds],
    () => fetchFiles({ sdk, fileIds }),
    {
      onError: (error) => {
        fireErrorNotification({ error, message: 'Could not find the file' });
      },
    }
  );
};
