/**
 * Get CDF Asset
 */

import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk';

export default function useCdfAsset(id = 0) {
  const {
    data: asset,
    isLoading,
    error,
  } = useCdfItem<Asset>('assets', { id }, { enabled: !!id });

  return {
    asset,
    isLoading,
    error,
  };
}
