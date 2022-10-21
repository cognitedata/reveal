import { mapEventsMetadataKeysWithQuery } from 'app/domain/events/internal/transformers/mapEventsMetadataKeysWithQuery';
import { useEventsListQuery } from 'app/domain/events/service/queries/useEventsListQuery';
import { useQueryString } from 'app/hooks/hooks';
import { SEARCH_KEY } from 'app/utils/constants';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';

export const useEventsSearchQueryMetadataKeysQuery = () => {
  const [query] = useQueryString(SEARCH_KEY);

  const { data } = useEventsListQuery({}, { enabled: !isEmpty(query) });

  return useMemo(
    () => mapEventsMetadataKeysWithQuery(data, query),
    [data, query]
  );
};
