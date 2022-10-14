import { useDocumentTotalAggregates } from '@cognite/react-document-search';
import { mapAggregatesToFilters } from '../../transformers/mapAggregatesToFilters';

export const useDocumentAggregateSourceQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['sourceFile', 'source'] },
  ]);

  return { data: mapAggregatesToFilters(data), ...rest };
};
