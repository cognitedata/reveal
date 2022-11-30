import { useSDK } from '@cognite/sdk-provider';

import { useQuery } from 'react-query';
import { queryKeys } from '../../../queryKeys';
import { getMetadataKeys } from '../network/getMetadataKeys';

export const useSequencesMetadataKeys = () => {
  const sdk = useSDK();
  return useQuery(queryKeys.sequencesMetadata(), () => {
    return getMetadataKeys(sdk);
  });
};
