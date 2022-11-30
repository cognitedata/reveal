import { useSDK } from '@cognite/sdk-provider';

import { useQuery } from 'react-query';
import { queryKeys } from '../../../queryKeys';
import { getMetadataKeys } from '../network/getMetadataKeys';

export const useTimeseriesMetadataKeys = () => {
  const sdk = useSDK();
  return useQuery(queryKeys.timeseriesMetadata(), () => {
    return getMetadataKeys(sdk);
  });
};
