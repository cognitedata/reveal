import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import { baseCacheKey } from '@cognite/sdk-react-query-hooks';

export const useFileDownloadLinks = (imageExternalIds: string[]) => {
  const sdk = useSDK();

  const uniqueItems = imageExternalIds.filter(
    (item, pos) => imageExternalIds.indexOf(item) === pos
  );

  return useQuery(
    [...baseCacheKey('files'), 'downloadLink', uniqueItems],
    async () => {
      if (uniqueItems.length === 0) {
        return [];
      }
      const result = await sdk.files.getDownloadUrls(
        uniqueItems.map((id) => ({ externalId: id }))
      );

      return result.map((item, index) => ({
        ...item,
        externalId: uniqueItems[index],
      }));
    }
  );
};
