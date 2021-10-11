import { DocumentsAggregate } from '@cognite/sdk-playground';

import { FacetsCounts } from '../types';

export const getFacetsCounts = (
  aggregates?: DocumentsAggregate[]
): FacetsCounts =>
  (aggregates || []).reduce(
    (countMap, aggregate) => ({
      ...countMap,
      [aggregate.name]: aggregate.total,
    }),
    {}
  );
