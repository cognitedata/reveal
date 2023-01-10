import { useMemo } from 'react';
import {
  InternalSequenceFilters,
  mapFiltersToSequenceAdvancedFilters,
  useSequenceListQuery,
} from '@data-exploration-lib/domain-layer';
import { mapMetadataKeysWithQuery } from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';

export const useSequenceSearchQueryMetadataKeysQuery = (
  query: string | undefined,
  sequenceFilters: InternalSequenceFilters
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToSequenceAdvancedFilters(sequenceFilters),
    [sequenceFilters]
  );

  const { data } = useSequenceListQuery(
    { advancedFilter },
    { enabled: !isEmpty(query) }
  );

  return useMemo(() => mapMetadataKeysWithQuery(data, query), [data, query]);
};
