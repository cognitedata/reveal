import { mapAggregatesToFilters } from '../../service';
import { useDocumentTotalAggregates } from '../../service';

type SourceDataType = { label: string; value: string };

export const useDocumentAggregateSourceQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['sourceFile', 'source'] },
  ]);

  // Using type assertions since we are aggregating the source property whose type will always return string
  return {
    data: mapAggregatesToFilters(data) as SourceDataType[],
    ...rest,
  };
};
