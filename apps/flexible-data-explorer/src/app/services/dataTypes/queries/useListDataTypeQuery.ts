import React from 'react';
import { useParams } from 'react-router-dom';

import { useInfiniteQuery } from '@tanstack/react-query';

import { EMPTY_ARRAY } from '../../../constants/object';
import { useFDM } from '../../../providers/FDMProvider';
import { useTypesDataModelQuery } from '../../dataModels/query/useTypesDataModelQuery';

export const useListDataTypeQuery = (sort?: Record<string, string>) => {
  const client = useFDM();
  const { dataType } = useParams();

  const { data, isLoading } = useTypesDataModelQuery();

  // const query = useSearchQueryParams();

  const { data: results, ...rest } = useInfiniteQuery(
    ['dataType', 'list', dataType, sort],
    async ({ pageParam }) => {
      if (!dataType) {
        return Promise.reject(new Error('Missing stuff'));
      }

      const result = await client.listDataTypes<any>(dataType, {
        cursor: pageParam,
        sort,
      });

      return result;
    },
    {
      enabled: data !== undefined || !isLoading,
      getNextPageParam: (param) =>
        param.pageInfo.hasNextPage && param.pageInfo.endCursor,
    }
  );

  const flattenResults = React.useMemo(
    () => results?.pages.flatMap((page) => page.items) || EMPTY_ARRAY,
    [results]
  );

  return { data: flattenResults, ...rest };
};
