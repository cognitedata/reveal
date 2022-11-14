import { useMemo } from 'react';
import {
  InternalSequenceFilters,
  mapFiltersToSequenceAdvancedFilters,
  useSequenceListQuery,
} from 'domain/sequence';
import { mapMetadataKeysWithQuery } from 'domain/transformers';
import { isEmpty } from 'lodash';

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
