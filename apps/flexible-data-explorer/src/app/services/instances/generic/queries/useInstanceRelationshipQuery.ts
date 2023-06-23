import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useInfiniteQuery } from '@tanstack/react-query';

import { EMPTY_ARRAY } from '../../../../constants/object';
import { ValueByField } from '../../../../containers/search/Filter';
import { useFDM } from '../../../../providers/FDMProvider';
import { buildFilterByField } from '../../../../utils/filterBuilder';
import { useTypesDataModelQuery } from '../../../dataModels/query/useTypesDataModelQuery';
import { extractFieldsFromSchema } from '../../../extractors';
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
  const { dataType, instanceSpace, externalId } = useParams();
  const { data: types } = useTypesDataModelQuery();

  const transformedFilter = useMemo(() => {
    return buildFilterByField(filters);
  }, [filters]);

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.instanceRelationship(
      { dataType, instanceSpace, externalId },
      client.getHeaders,
      type,
      transformedFilter
    ),
    async ({ pageParam }) => {
      if (!(dataType && externalId && instanceSpace && types)) {
        return Promise.reject(new Error('Missing headers...'));
      }

      const extractedFields = extractFieldsFromSchema(types, type);

      // Fix me!
      const fields = extractedFields
        ?.filter((item) => client.isPrimitive(item.type.name))
        .map((item) => item.name);

      if (!fields) {
        return Promise.reject(new Error('Missing fields...'));
      }

      // TOTALLY FIX THIS!
      const instance = await client.getInstanceById<any>(
        [
          {
            operation: field,
            variables: {
              first: 100,
              after: pageParam,
              filter: {
                value: transformedFilter || {},
                name: 'filter',
                type: `_List${type}Filter`,
              },
            },
            fields: [
              {
                items: ['externalId', ...fields],
              },
              { pageInfo: ['hasNextPage', 'endCursor'] },
            ],
          },
        ],
        {
          instanceSpace,
          dataType,
          externalId,
        }
      );

      return instance[field];
    },
    {
      enabled: !!types,
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
