import isEmpty from 'lodash/isEmpty';

import { CogniteInternalId, IdEither, TimeseriesFilter } from '@cognite/sdk';

import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

export const mapInternalFilterToTimeseriesFilter = ({
  assetSubtreeIds,
  assetIds,
}: InternalTimeseriesFilters): TimeseriesFilter | undefined => {
  let filters: TimeseriesFilter = {};

  const directAssetIds: CogniteInternalId[] = (assetIds || []).map(
    (id) => id.value
  );
  const allAssetIds: IdEither[] = (assetSubtreeIds || []).map((id) => ({
    id: id.value,
  }));

  if (directAssetIds.length > 0) {
    filters = { ...filters, assetIds: directAssetIds };
  }

  if (allAssetIds.length > 0) {
    filters = { ...filters, assetSubtreeIds: allAssetIds };
  }

  return !isEmpty(filters) ? filters : undefined;
};
