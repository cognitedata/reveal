import { AssetFilterProps } from '@cognite/sdk/dist/src';
import { isEmpty } from 'lodash';
import { InternalAssetFilters } from '../types';

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
