import { TimeseriesFilter } from '@cognite/sdk/dist/src';
import { InternalTimeseriesFilters } from '../types';
import { isEmpty } from 'lodash';

export const mapInternalFilterToTimeseriesFilter = ({
  assetSubtreeIds,
  dataSetIds,
  ...rest
}: InternalTimeseriesFilters): TimeseriesFilter | undefined => {
  let filters: TimeseriesFilter = { ...rest };

  if (assetSubtreeIds && assetSubtreeIds.length > 0) {
    filters = {
      ...filters,
      assetSubtreeIds: assetSubtreeIds.map(({ value }) => ({
        id: value,
      })),
    };
  }

  if (dataSetIds && dataSetIds.length > 0) {
    filters = {
      ...filters,
      dataSetIds: dataSetIds.map(({ value }) => ({
        id: value,
      })),
    };
  }

  return !isEmpty(filters) ? filters : undefined;
};
