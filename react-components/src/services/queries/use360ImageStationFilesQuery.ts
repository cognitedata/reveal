
import { useSDK } from '@cognite/sdk-provider';
import { FileInfo } from '@cognite/sdk';
import { useQuery } from 'react-query';
import { getFileByStationId } from '../network';

export const use360ImageStationFilesQuery = (stationId: string | undefined) => {
  const sdk = useSDK();

  return useQuery<FileInfo[] | undefined>(
    ['cdf', 'file', '360image', stationId],
    () => {
      if (!stationId) {
        return undefined;
      }
      return getFileByStationId(sdk, stationId, 'front');
    },
    { enabled: !!stationId }
  );
};
