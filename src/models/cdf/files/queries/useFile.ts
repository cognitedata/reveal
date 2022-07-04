import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';

export default function useFile(fileId?: number) {
  const sdk = useSDK();
  return useQuery({
    queryKey: ['cdf', 'files', fileId],
    queryFn: async () => {
      const fileQueryResult = await sdk.files.retrieve([{ id: fileId! }]);
      if (fileQueryResult.length === 0)
        throw new Error(`File ${fileId} not found`);

      return fileQueryResult[0];
    },
    enabled: !!fileId,
    retry: false,
    cacheTime: fileId ? 6 * 60 * 60 * 1000 : 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
