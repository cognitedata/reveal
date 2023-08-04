import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useInfiniteQuery } from '@tanstack/react-query';

import { EMPTY_ARRAY } from '../../../../constants/object';
import { ValueByField } from '../../../../containers/Filter';
import {
  useDataModelPathParams,
  useInstancePathParams,
} from '../../../../hooks/usePathParams';
import { useFDM } from '../../../../providers/FDMProvider';
import { buildFilterByField } from '../../../../utils/filterBuilder';
import { queryKeys } from '../../../queryKeys';
import { DataModelV2, Instance } from '../../../types';

export const useInstanceRelationshipQuery = (
  {
    type,
    field,
  }: {
    field: string;
    type: string;
  },
  filters?: ValueByField,
  {
    instance,
    model,
  }: {
    instance?: Instance;
    model?: DataModelV2;
  } = {},
  {
    suspense,
    enabled,
  }: {
    suspense?: boolean;
    enabled?: boolean;
  } = {}
) => {
  const client = useFDM();

  const dataModelPathParam = useDataModelPathParams();
  const instancePathParam = useInstancePathParams();

  const { dataType, instanceSpace, externalId } = instance || instancePathParam;
  const { dataModel, version, space } = model
    ? { ...model, dataModel: model.externalId }
    : dataModelPathParam;

  const transformedFilter = useMemo(() => {
    return buildFilterByField(filters);
  }, [filters]);

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.instanceRelationship(
      { dataType, instanceSpace, externalId },
      { externalId: dataModel, space, version },
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

      const results = await client.getEdgeRelationshipInstancesById(
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

      return results[field];
    },
    {
      getNextPageParam: (param) =>
        param.pageInfo.hasNextPage && param.pageInfo.endCursor,
      suspense,
      enabled,
    }
  );

  const flattenResults = useMemo(
    () => data?.pages.flatMap((page) => page.items) || EMPTY_ARRAY,
    [data]
  );

  return { data: flattenResults, ...rest };
};
