import { TimeseriesFilter } from '@cognite/sdk/dist/src';
import { InternalTimeseriesFilters } from '@data-exploration-lib/core';
import isEmpty from 'lodash/isEmpty';

export const mapInternalFilterToTimeseriesFilter = ({
  assetSubtreeIds,
}: InternalTimeseriesFilters): TimeseriesFilter | undefined => {
  let filters: TimeseriesFilter = {};

  if (assetSubtreeIds && assetSubtreeIds.length > 0) {
    filters = {
      ...filters,
      assetSubtreeIds: assetSubtreeIds.map(({ value }) => ({
        id: value,
      })),
    };
  }

  return !isEmpty(filters) ? filters : undefined;
};
