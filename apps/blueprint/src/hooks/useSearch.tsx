import { useAuthContext } from '@cognite/react-container';
import { Asset, FileInfo } from '@cognite/sdk';
import { useCallback } from 'react';

import useConfig from './useConfig';

export const useSearch = () => {
  const { client } = useAuthContext();
  const config = useConfig(client?.project);

  const search = useCallback(
    async (
      query: string
    ): Promise<{
      files: FileInfo[];
      assets: Asset[];
    }> => {
      if (!client) {
        return { files: [], assets: [] };
      }

      const files = await client.files.search({
        filter: config.fileFilter,
        search: {
          name: query,
        },
      });

      const assets = await client.assets.search({
        search: {
          name: query,
        },
      });

      return { files, assets };
    },
    [client]
  );

  return {
    search,
  };
};
