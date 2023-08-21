import isEmpty from 'lodash/isEmpty';

import { CogniteInternalId, IdEither, SequenceFilter } from '@cognite/sdk';

import { InternalSequenceFilters } from '@data-exploration-lib/core';

export const mapInternalFilterToSequenceFilter = ({
  assetSubtreeIds,
  assetIds,
}: InternalSequenceFilters): Required<SequenceFilter>['filter'] | undefined => {
  let filters: Required<SequenceFilter>['filter'] = {};

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
