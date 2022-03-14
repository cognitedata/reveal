import compact from 'lodash/compact';

import { DocumentsAggregate } from '@cognite/sdk-playground';

import { FacetsCounts } from '../types';

export const getFacetsCounts = (
  aggregates?: DocumentsAggregate[]
): FacetsCounts =>
  compact(aggregates).reduce((countMap, aggregate) => {
    return {
      ...countMap,
      [aggregate.name]: aggregate.total,
    };
  }, {});
