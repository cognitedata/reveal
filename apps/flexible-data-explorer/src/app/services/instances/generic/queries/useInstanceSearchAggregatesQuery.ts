import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSiteConfig } from '../../../../hooks/useConfig';
import {
  useDataTypeFilterParams,
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../../../hooks/useParams';
import { useFDM } from '../../../../providers/FDMProvider';
import {
  buildFilterByDataType,
  buildFilterByField,
} from '../../../../utils/filterBuilder';
import { queryKeys } from '../../../queryKeys';

export const useInstanceSearchAggregateQuery = () => {
  const client = useFDM();
  const siteConfig = useSiteConfig();

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

  const [filters] = useDataTypeFilterParams(dataType);

  const transformedFilter = useMemo(() => {
    return buildFilterByField(filters);
  }, [filters]);

  return useQuery(
    queryKeys.searchAggregateValueByProperty(
      dataType,
      field,
      query,
      transformedFilter,
      property
    ),
    async () => {
      const result = await client.searchAggregateValueByProperty<T>(
        { dataType, field },
        query,
        transformedFilter,
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
