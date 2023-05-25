import {
  mapAggregatesToFilters,
  useDocumentTotalAggregates,
} from '../../service';

export const useDocumentAggregateMimeTypeQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['sourceFile', 'mimeType'] },
  ]);

  return { data: mapAggregatesToFilters(data), ...rest };
};
