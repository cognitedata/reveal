import {
  QueryKey,
  UseQueryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { CogniteClient, CogniteError, DataSet, InternalId } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { API } from '../types/api';

import { fetchAggregate } from './aggregates';

type T = API | 'documents';

const getAllDatasets = (sdk: CogniteClient) =>
  sdk.datasets.list({ limit: 1000 }).autoPagingToArray({ limit: -1 });

const allDataSetsKey = (api?: T): QueryKey => ['datasets', api];
export const useAllDataSets = (
  options?: UseQueryOptions<DataSet[], CogniteError, DataSet[]>
) => {
  const sdk = useSDK();

  return useQuery(allDataSetsKey(), () => getAllDatasets(sdk), {
    staleTime: 60000,
    ...options,
  });
};

type DatasetWithResourceCount = DataSet & { count?: number };

export const useDataSets = (
  api: T,
  options?: UseQueryOptions<DatasetWithResourceCount[], CogniteError>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useQuery(
    allDataSetsKey(api),
    async () => {
      // Aggregate call does not work for Files
      try {
        if (api === 'threeD') {
          throw new Error('3D not supported');
        } else {
          const aggregate = await fetchAggregate(
            sdk,
            queryClient,
            {
              type: api,
              aggregate: 'uniqueValues',
              properties: [
                {
                  property:
                    api === 'documents'
                      ? ['sourceFile', 'dataSetId']
                      : ['dataSetId'],
                },
              ],
            },
            { retry: false, staleTime: 60000 }
          );

          const dataSetIds: InternalId[] =
            aggregate
              ?.filter(
                (i) =>
                  !!i.values?.[0] &&
                  Number.isFinite(parseInt(`${i.values?.[0]}`, 10))
              )
              .map((i) => ({
                id: parseInt(i.values?.[0] as string, 10),
              })) || [];

          const datasets =
            dataSetIds.length > 0
              ? await sdk.datasets.retrieve(dataSetIds)
              : [];
          return datasets.map(
            (ds): DatasetWithResourceCount => ({
              ...ds,
              count: aggregate?.find((a) => `${a.values?.[0]}` === `${ds.id}`)
                ?.count,
            })
          );
        }
      } catch {
        return queryClient.fetchQuery(
          allDataSetsKey(),
          () => getAllDatasets(sdk),
          { retry: false }
        );
      }
    },
    {
      staleTime: 60000,
      ...options,
    }
  );
};
