import { useDocumentTotalAggregates } from '@cognite/data-exploration';
import { mapAggregatesToFilters } from '../../transformers/mapAggregatesToFilters';

export const useDocumentAggregateFileTypeQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['type'] },
  ]);

  return { data: mapAggregatesToFilters(data), ...rest };
};
