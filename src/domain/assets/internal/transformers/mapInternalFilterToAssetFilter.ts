import { AssetFilterProps } from '@cognite/sdk/dist/src';
import { isEmpty } from 'lodash';
import { InternalAssetFilters } from '../types';

// Here put the fields that are not existing/available in advanced filters!?
export const mapInternalFilterToAssetFilter = ({
  assetSubtreeIds,
  labels,
}: InternalAssetFilters): AssetFilterProps | undefined => {
  let filters: AssetFilterProps = {};

  if (assetSubtreeIds && assetSubtreeIds.length > 0) {
    filters = {
      ...filters,
      assetSubtreeIds: assetSubtreeIds.map(({ value }) => ({
        id: value,
      })),
    };
  }

  // Is labels supported by advanced filters?
  // TODO Yes, we need to move this to advanced filters!
  if (labels && labels.length > 0) {
    filters = {
      ...filters,
      labels: {
        containsAny: labels.map(({ value }) => ({ externalId: value })),
      },
    };
  }

  return !isEmpty(filters) ? filters : undefined;
};
