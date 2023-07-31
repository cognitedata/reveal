import compact from 'lodash/compact';

import { DocumentSearchAggregate } from '@cognite/sdk';

import { FacetsCounts } from '../types';

export const getFacetsCounts = (
  aggregates?: DocumentSearchAggregate[]
): FacetsCounts =>
  compact(aggregates).reduce((countMap, aggregate) => {
    return {
      ...countMap,
      [aggregate.name]: aggregate.total,
    };
  }, {});
