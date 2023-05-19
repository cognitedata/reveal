import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { FileInfo } from '@cognite/sdk';

export const useFileInfo = (id?: number) => {
  const sdk = useSDK();

  return useQuery<FileInfo | undefined>(
    ['fileInfo', id],
    async () => {
      if (id === undefined) {
        return undefined;
      }

      const fileInfos = await sdk.files.retrieve([{ id }]);
      return fileInfos[0];
    },
    { enabled: Boolean(id) }
  );
};
