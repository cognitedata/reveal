import { useSDK } from '@cognite/sdk-provider';
import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';
import { EMPTY_ARRAY } from '../../../constants/object';
import { useTypesDataModelQuery } from '../../dataModels/query/useTypesDataModelQuery';
import { FDMClient } from '../../FDMClient';

export const useListDataTypeQuery = (sort?: Record<string, string>) => {
  const sdk = useSDK();
  const client = new FDMClient(sdk);
  const { space, dataModel, version, dataType } = useParams();

  const { data, isLoading } = useTypesDataModelQuery();

  // const query = useSearchQueryParams();

  const { data: results, ...rest } = useInfiniteQuery(
    ['dataType', 'list', space, dataModel, version, dataType, sort],
    async ({ pageParam }) => {
      if (!(space && dataModel && version && dataType)) {
        return Promise.reject(new Error('Missing stuff'));
      }

      const result = await client.listDataTypes<any>(dataType, {
        space,
        dataModel,
        version,
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
