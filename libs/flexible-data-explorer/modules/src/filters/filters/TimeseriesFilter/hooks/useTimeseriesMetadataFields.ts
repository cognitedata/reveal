import { useMemo } from 'react';

import { useTimeseriesMetadataKeysQuery } from '@fdx/services/instances/timeseries';
import { EMPTY_ARRAY } from '@fdx/shared/constants/object';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';

import { mapToMetadataFields } from '../utils';

export const useTimeseriesMetadataFields = (query?: string) => {
  const { data: initialData = EMPTY_ARRAY, isInitialLoading } =
    useTimeseriesMetadataKeysQuery();

  const { data: dynamicData = EMPTY_ARRAY } = useTimeseriesMetadataKeysQuery({
    query,
    enabled: initialData.length === 1000 && !isEmpty(query),
  });

  const initialMetadataFields = useMemo(() => {
    return mapToMetadataFields(initialData);
  }, [initialData]);

  const dynamicMetadataFields = useMemo(() => {
    return mapToMetadataFields(dynamicData);
  }, [dynamicData]);

  const metadataFields = useMemo(() => {
    return uniqBy([...initialMetadataFields, ...dynamicMetadataFields], 'id');
  }, [dynamicMetadataFields, initialMetadataFields]);

  return {
    data: metadataFields,
    isLoading: isInitialLoading,
  };
};
