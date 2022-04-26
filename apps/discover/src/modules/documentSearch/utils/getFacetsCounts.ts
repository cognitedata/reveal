import compact from 'lodash/compact';

import { DocumentSearchResponse } from '@cognite/sdk';

import { FacetsCounts } from '../types';

export const getFacetsCounts = (
  aggregates?: DocumentSearchResponse['aggregates']
): FacetsCounts =>
  compact(aggregates).reduce((countMap, aggregate) => {
    return {
      ...countMap,
      [aggregate.name]: aggregate.total,
    };
  }, {});
