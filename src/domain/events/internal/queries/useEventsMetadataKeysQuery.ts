import { useEventsListQuery } from 'domain/events/service/queries/useEventsListQuery';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { mapEventsMetadataKeysWithQuery } from '../transformers/mapEventsMetadataKeysWithQuery';

export const useEventsSearchQueryMetadataKeysQuery = (query?: string) => {
  const { data } = useEventsListQuery({}, { enabled: !isEmpty(query) });

  return useMemo(
    () => mapEventsMetadataKeysWithQuery(data, query),
    [data, query]
  );
};
