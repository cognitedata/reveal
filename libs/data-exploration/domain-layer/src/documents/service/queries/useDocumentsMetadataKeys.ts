import { useSDK } from '@cognite/sdk-provider';

import { useQuery } from 'react-query';
import { queryKeys } from '../../../queryKeys';
import { getMetadataKeys } from '../network/getMetadataKeys';

export const useDocumentsMetadataKeys = () => {
  const sdk = useSDK();
  return useQuery(queryKeys.documentsMetadata(), () => {
    return getMetadataKeys(sdk);
  });
};
