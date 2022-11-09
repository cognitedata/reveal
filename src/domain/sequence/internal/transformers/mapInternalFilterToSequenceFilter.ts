import { SequenceFilter } from '@cognite/sdk/dist/src';
import { InternalSequenceFilters } from '../types';
import { isEmpty } from 'lodash';

export const mapInternalFilterToSequenceFilter = ({
  assetSubtreeIds,
  dataSetIds,
  metadata,
  ...rest
}: InternalSequenceFilters): Required<SequenceFilter>['filter'] | undefined => {
  let filters: Required<SequenceFilter>['filter'] = { ...rest };

  if (metadata && metadata.length > 0) {
    filters = {
      ...filters,
      metadata: metadata.reduce((accumulator, { key, value }) => {
        return {
          ...accumulator,
          [key]: value,
        };
      }, {}),
    };
  }

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
