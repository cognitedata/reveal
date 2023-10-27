import { useQuery } from '@tanstack/react-query';

import { FileInfo } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';
import { getContainerConfigFromFileInfo } from '@cognite/unified-file-viewer';

import { queryKeys } from '../../queryKeys';

export const getContainerId = (fileId: number) => {
  return String(fileId);
};

export const MAX_CONTAINER_WIDTH = 5000;
export const MAX_CONTAINER_HEIGHT = 5000;

export const useFileContainerQuery = (file?: FileInfo) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.fileContainer(file),
    async () => {
      if (file === undefined) {
        return Promise.reject(new Error('File id not found in conatiner'));
      }

      const results = await getContainerConfigFromFileInfo(sdk as any, file, {
        id: getContainerId(file.id),
        maxWidth: MAX_CONTAINER_WIDTH,
        maxHeight: MAX_CONTAINER_HEIGHT,
      });

      return results;
    },
    {
      enabled: file !== undefined,
    }
  );
};
