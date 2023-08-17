import { useMemo } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

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
  entry: {
    field: string;
    type: string;
    fields?: any[];
    edges?: any[];
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
      entry,
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
          relatedField: entry.field,
          relatedType: entry.type,
          fields: entry.fields,
          edges: entry.edges,
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

      return results?.[entry.field];
    },
    {
      getNextPageParam: (param) =>
        param?.pageInfo.hasNextPage && param?.pageInfo.endCursor,
      suspense,
      enabled,
    }
  );

  const flattenResults = useMemo(() => {
    if (!data) {
      return {
        items: [],
        edges: [],
      };
    }

    return data?.pages.reduce(
      (acc, page) => {
        if (!page) {
          return acc;
        }
        return {
          items: [...acc.items, ...page?.items],
          edges: [...acc.edges, ...(page?.edges || [])],
        };
      },
      { items: [], edges: [] } as { items: any[]; edges: any[] }
    );
  }, [data]);

  return { data: flattenResults, ...rest };
};
