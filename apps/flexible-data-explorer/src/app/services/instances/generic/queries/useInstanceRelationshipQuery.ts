import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useInfiniteQuery } from '@tanstack/react-query';

import { EMPTY_ARRAY } from '../../../../constants/object';
import { ValueByField } from '../../../../containers/Filter';
import { useFDM } from '../../../../providers/FDMProvider';
import { buildFilterByField } from '../../../../utils/filterBuilder';
import { queryKeys } from '../../../queryKeys';

export const useInstanceRelationshipQuery = (
  {
    type,
    field,
  }: {
    field: string;
    type: string;
  },
  filters?: ValueByField
) => {
  const client = useFDM();
  const { dataType, instanceSpace, externalId, dataModel, version, space } =
    useParams();

  const transformedFilter = useMemo(() => {
    return buildFilterByField(filters);
  }, [filters]);

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.instanceRelationship(
      { dataType, instanceSpace, externalId },
      type,
      transformedFilter
    ),
    async ({ pageParam }) => {
      if (
        !(
          dataType &&
          externalId &&
          instanceSpace &&
          dataModel &&
          version &&
          space
        )
      ) {
        return Promise.reject(new Error('Missing headers...'));
      }

      const instance = await client.getEdgeRelationshipInstancesById(
        transformedFilter,
        {
          relatedField: field,
          relatedType: type,
        },
        {
          dataModel,
          version,
          space,
          dataType,
          instanceSpace,
          externalId,
        },
        {
          cursor: pageParam,
        }
      );

      return instance[field];
    },
    {
      getNextPageParam: (param) =>
        param.pageInfo.hasNextPage && param.pageInfo.endCursor,
    }
  );

  const flattenResults = useMemo(
    () => data?.pages.flatMap((page) => page.items) || EMPTY_ARRAY,
    [data]
  );

  return { data: flattenResults, ...rest };
};
