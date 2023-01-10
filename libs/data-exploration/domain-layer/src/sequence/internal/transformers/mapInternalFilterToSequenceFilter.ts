import { SequenceFilter } from '@cognite/sdk/dist/src';
import isEmpty from 'lodash/isEmpty';
import { InternalSequenceFilters } from '../types';

export const mapInternalFilterToSequenceFilter = ({
  assetSubtreeIds,
}: InternalSequenceFilters): Required<SequenceFilter>['filter'] | undefined => {
  let filters: Required<SequenceFilter>['filter'] = {};

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
