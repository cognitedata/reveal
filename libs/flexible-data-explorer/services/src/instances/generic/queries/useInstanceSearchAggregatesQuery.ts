import { useMemo } from 'react';

import { useSelectedSiteConfig } from '@fdx/shared/hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import {
  buildFilterByDataType,
  buildFilterByField,
} from '@fdx/shared/utils/filterBuilder';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../queryKeys';

export const useInstanceSearchAggregateQuery = () => {
  const client = useFDM();
  const siteConfig = useSelectedSiteConfig();

  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();

  const transformedFilter = useMemo(() => {
    return buildFilterByDataType(filters, siteConfig);
  }, [filters, siteConfig]);

  return useQuery(
    queryKeys.searchAggregates(query, transformedFilter),
    async () => {
      const results = await client.searchAggregateCount(
        query,
        transformedFilter,
        siteConfig
      );

      return results;
    },
    {
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};

export const useSearchAggregateValuesQuery = ({
  dataType,
  field,
  query = '',
}: {
  dataType: string;
  field: string;
  query?: string;
}) => {
  const client = useFDM();

  const [filters] = useDataTypeFilterParams(dataType);

  const transformedFilter = useMemo(() => {
    return buildFilterByField(filters);
  }, [filters]);

  return useQuery(
    queryKeys.searchAggregateValues(dataType, field, query, transformedFilter),
    async () => {
      const results = await client.searchAggregateValues(
        { dataType, field },
        query,
        transformedFilter
      );

      return results;
    }
  );
};

export const useSearchAggregateValueByPropertyQuery = <T>({
  dataType,
  field,
  query = '',
  property,
}: {
  dataType: string;
  field: string;
  query?: string;
  property: string;
}) => {
  const client = useFDM();

  // const { data: types } = useTypesDataModelQuery();

  return useQuery(
    queryKeys.searchAggregateValueByProperty(dataType, field, query, property),
    async () => {
      const result = await client.searchAggregateValueByProperty<T>(
        { dataType, field },
        query,
        property
      );

      return result;
    },
    {
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};
