import { useSDK } from '@cognite/sdk-provider';

import { useQuery } from 'react-query';
import { queryKeys } from '../../../queryKeys';
import { getMetadataKeys } from '../network/getMetadataKeys';

export const useEventsMetadataKeys = () => {
  const sdk = useSDK();
  return useQuery(queryKeys.eventsMetadata(), () => {
    return getMetadataKeys(sdk);
  });
};
