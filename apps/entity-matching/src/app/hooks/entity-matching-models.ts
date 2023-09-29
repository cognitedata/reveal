import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
  useMutation,
} from '@tanstack/react-query';

import { CogniteError, EntityMatchingModel } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { EMFeatureType, ModelMapping } from '../context/QuickMatchContext';
import {
  RawCogniteEvent,
  RawFileInfo,
  RawSource,
  RawTarget,
  RawTimeseries,
  SourceType,
} from '../types/api';
import { filterFieldsFromObjects } from '../utils';

import { JobStatus } from './types';

// Type in SDK is not correct
export type EMModel = Omit<EntityMatchingModel, 'status' | 'matchFields'> & {
  status: JobStatus;
  matchFields?: ModelMapping;
};

const getEMModelsKey = (): QueryKey => ['em', 'models'];
export const useEMModels = (
  opts?: UseInfiniteQueryOptions<
    {
      nextCursor?: string;
      items: EMModel[];
    },
    CogniteError
  >
) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    getEMModelsKey(),
    // @ts-ignore SDK Type incorrect
    ({ pageParam }) => sdk.entityMatching.list({ cursor: pageParam }),
    {
      getNextPageParam(lastPage) {
        return lastPage.nextCursor;
      },
      ...opts,
    }
  );
};

const getEMModelKey = (id: number): QueryKey => ['em', 'models', id];
export const useEMModel = (
  id: number,
  opts?: UseQueryOptions<EMModel, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getEMModelKey(id),
    // @ts-ignore SDK  type incorrect
    () => sdk.entityMatching.retrieve([{ id }]).then((r) => r[0]),
    opts
  );
};

type ConfirmedMatch = {
  sourceId: number;
  targetId: number;
};

export const useCreateEMModel = () => {
  const sdk = useSDK();

  return useMutation(
    ['create-em-model'],
    async ({
      sourceType,
      sources,
      targets,
      matchFields,
      featureType,
      supervisedMode,
    }: {
      sourceType: SourceType;
      sources: RawSource[];
      targets: RawTarget[];
      matchFields: ModelMapping;
      featureType: EMFeatureType;
      supervisedMode?: boolean;
    }) => {
      const trueMatches = supervisedMode
        ? sources.reduce((accl: ConfirmedMatch[], item) => {
            if (sourceType === 'events' || sourceType === 'timeseries') {
              return (item as RawFileInfo | RawCogniteEvent).assetIds
                ? [
                    ...accl,
                    ...((item as RawFileInfo | RawCogniteEvent).assetIds?.map(
                      (assetId) => ({
                        sourceId: item.id,
                        targetId: assetId,
                      })
                    ) ?? []),
                  ]
                : accl;
            }
            return !!(item as RawTimeseries).assetId
              ? [
                  ...accl,
                  {
                    sourceId: item.id,
                    targetId: (item as RawTimeseries).assetId as number,
                  },
                ]
              : accl;
          }, [])
        : undefined;

      const filteredSources = filterFieldsFromObjects(sources, [
        'id',
        ...matchFields
          .filter((source) => !!source)
          .map(({ source }) => source as string),
      ]);

      const filteredTargets = filterFieldsFromObjects(targets, [
        'id',
        ...matchFields
          .filter((target) => !!target)
          .map(({ target }) => target as string),
      ]);

      return sdk
        .post<EMModel>(
          `/api/v1/projects/${sdk.project}/context/entitymatching`,
          {
            data: {
              ignoreMissingFields: true,
              featureType,
              sources: filteredSources,
              targets: filteredTargets,
              trueMatches,
              matchFields: matchFields.filter(
                ({ source, target }) => !!source && !!target
              ),
            },
          }
        )
        .then((r) => {
          if (r.status === 200) {
            return r.data;
          } else {
            return Promise.reject(r);
          }
        });
    }
  );
};
