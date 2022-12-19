import { mapAggregatesToFilters } from '../../service';
import { useDocumentTotalAggregates } from '../../service';

export const useDocumentAggregateSourceQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['sourceFile', 'source'] },
  ]);

  return { data: mapAggregatesToFilters(data), ...rest };
};
