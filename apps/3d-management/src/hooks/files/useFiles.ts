import { fireErrorNotification } from '@3d-management/utils';
import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { FileInfo, HttpError } from '@cognite/sdk';

const fetchFiles = ({
  fileIds,
}: {
  fileIds: number[];
}): Promise<FileInfo[]> => {
  return sdk.files.retrieve(fileIds.map((id) => ({ id })));
};

export const useFiles = (fileIds: number[]) => {
  return useQuery<FileInfo[], HttpError>(
    [fileIds],
    () => fetchFiles({ fileIds }),
    {
      onError: (error) => {
        fireErrorNotification({ error, message: 'Could not find the file' });
      },
    }
  );
};
