import { useQuery } from '@tanstack/react-query';

import { FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useFileInfos = (fileIds: number[]) => {
  const sdk = useSDK();
  const result = useQuery<FileInfo[]>(
    [`canvas-files-${fileIds.join(',')}`],
    () =>
      fileIds.length === 0
        ? []
        : sdk.files.retrieve(fileIds.map((id) => ({ id })))
  );

  return result;
};
