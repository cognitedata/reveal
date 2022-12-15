import { useSDK } from '@cognite/sdk-provider';

import { useQuery } from 'react-query';
import { queryKeys } from '../../../queryKeys';
import { getMetadataKeys } from '../network/getMetadataKeys';

export const useAssetsMetadataKeys = () => {
  const sdk = useSDK();
  return useQuery(queryKeys.assetsMetadata(), () => {
    return getMetadataKeys(sdk);
  });
};
