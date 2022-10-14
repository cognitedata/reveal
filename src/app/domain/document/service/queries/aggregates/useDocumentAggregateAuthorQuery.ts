import { useDocumentTotalAggregates } from '@cognite/react-document-search';
import { mapAggregatesToFilters } from '../../transformers/mapAggregatesToFilters';

export const useDocumentAggregateAuthorQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['author'] },
  ]);

  return { data: mapAggregatesToFilters(data), ...rest };
};
