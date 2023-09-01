import { useSDK } from '@cognite/sdk-provider';

import { View } from '../../types';

import { useCreateAdvancedJoin } from './useCreateAdvancedJoin';
import { useFindAdvancedJoins } from './useFindAdvancedJoins';

export const useAdvancedJoin = (headerName: string, view?: View) => {
  const sdk = useSDK();

  const existingAdvancedJoin = useFindAdvancedJoins(sdk, headerName, view);

  const shouldCreateAdvancedJoin =
    !!view && existingAdvancedJoin?.data?.length === 0;

  const newAdvancedJoin = useCreateAdvancedJoin(
    sdk,
    headerName,
    view,
    shouldCreateAdvancedJoin
  );

  if (existingAdvancedJoin?.data !== undefined) {
    return existingAdvancedJoin.data[0];
  } else if (newAdvancedJoin?.data !== undefined) {
    return newAdvancedJoin.data[0];
  }

  return undefined;
};
