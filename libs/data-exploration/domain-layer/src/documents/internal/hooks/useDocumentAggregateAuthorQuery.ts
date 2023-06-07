import {
  mapAggregatesToFilters,
  useDocumentTotalAggregates,
} from '../../service';

export const useDocumentAggregateAuthorQuery = () => {
  const { data, ...rest } = useDocumentTotalAggregates([
    { property: ['author'] },
  ]);

  return { data: mapAggregatesToFilters(data), ...rest };
};
