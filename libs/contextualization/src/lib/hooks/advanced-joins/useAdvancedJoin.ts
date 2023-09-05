import { useSDK } from '@cognite/sdk-provider';

import { View } from '../../types';

import { useCreateAdvancedJoin } from './useCreateAdvancedJoin';
import { useFindAdvancedJoins } from './useFindAdvancedJoins';

export const useAdvancedJoin = (
  headerName: string,
  view?: View
): { advancedJoin: any; isLoading: boolean } => {
  const sdk = useSDK();

  const { data = [], status } = useFindAdvancedJoins(sdk, headerName, view);

  const shouldCreateAdvancedJoin = !!view && data?.length === 0;

  const { data: newAdvancedJoinData = [] } = useCreateAdvancedJoin(
    sdk,
    headerName,
    view,
    shouldCreateAdvancedJoin
  );

  return {
    advancedJoin: data[0] || newAdvancedJoinData[0],
    isLoading: status === 'loading',
  };
};
