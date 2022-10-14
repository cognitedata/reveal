import { useDocumentTotalAggregates } from '@cognite/react-document-search';
import { mapAggregatesToFilters } from '../../transformers/mapAggregatesToFilters';

export const useDocumentAggregateMimeTypeQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['sourceFile', 'mimeType'] },
  ]);

  return { data: mapAggregatesToFilters(data), ...rest };
};
