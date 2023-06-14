import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';

export const use3DModelThumbnailQuery = (url?: string) => {
  const sdk = useSDK();

  const query = useQuery<ArrayBuffer>(
    queryKeys.get3DThumbnail(url),
    async () => {
      if (url) {
        const resp = await sdk.get(url, {
          headers: {
            Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          },
          responseType: 'arraybuffer',
        });
        return resp.data;
      }
      throw new Error('url not found!');
    },
    { enabled: !!url }
  );
  return {
    ...query,
    isLoading: query.isLoading && query.fetchStatus !== 'idle',
  };
};
