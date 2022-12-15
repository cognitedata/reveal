import { mapAggregatesToFilters } from '../../service';
import { useDocumentTotalAggregates } from '../../service';

export const useDocumentAggregateMimeTypeQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['sourceFile', 'mimeType'] },
  ]);

  return { data: mapAggregatesToFilters(data), ...rest };
};
