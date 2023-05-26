import { mapAggregatesToFilters } from '../../transformers/mapAggregatesToFilters';

import { useDocumentTotalAggregates } from './useDocumentTotalAggregates';

export const useDocumentAggregateFileTypeQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['type'] },
  ]);

  return { data: mapAggregatesToFilters(data), ...rest };
};
