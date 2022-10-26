import {
  AssetMapping3D,
  CogniteError,
  Model3D,
  Revision3D,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useMemo } from 'react';
import { useQueries, useQuery, UseQueryOptions } from 'react-query';

const BASE_THREE_D_QUERY_KEY = 'data-exploration-three-d';

const getThreeDModelsQueryKey = () => [BASE_THREE_D_QUERY_KEY, 'model', 'list'];

const getRevisionsQuerKey = (modelId: number) => [
  BASE_THREE_D_QUERY_KEY,
  'model',
  modelId,
  'revision',
  'list',
];

const getAssetMappingsQueryKey = (modelId: number, revisionId: number = -1) => [
  BASE_THREE_D_QUERY_KEY,
  'model',
  modelId,
  'revision',
  revisionId,
  'asset-mapping',
  'list',
];

export const useThreeDModels = (
  options?: UseQueryOptions<Model3D[], CogniteError, Model3D[], string[]>
) => {
  const sdk = useSDK();

  return useQuery(
    getThreeDModelsQueryKey(),
    () => sdk.models3D.list().autoPagingToArray({ limit: -1 }),
    options
  );
};

export type ThreeDModelWithRevisions = Model3D & {
  revisions: Revision3D[];
};

export const useThreeDModelsWithRevisions = (
  options: UseQueryOptions<
    Revision3D[],
    CogniteError,
    Revision3D[],
    string[]
  > = { enabled: true }
) => {
  const sdk = useSDK();

  const { data: threeDModels = [], isFetched: didFetchThreeDModels } =
    useThreeDModels();

  const revisionQueries = useQueries(
    threeDModels?.map(({ id: modelId }) => ({
      queryKey: getRevisionsQuerKey(modelId),
      queryFn: () =>
        sdk.revisions3D.list(modelId).autoPagingToArray({ limit: -1 }),
      options: {
        ...options,
        enabled: didFetchThreeDModels && options.enabled,
      },
    }))
  );

  const isFetched =
    didFetchThreeDModels && revisionQueries.every(({ isFetched }) => isFetched);
  const isFetching = revisionQueries.some(({ isFetching }) => isFetching);
  const isLoading = revisionQueries.some(({ isLoading }) => isLoading);
  const isSuccess = revisionQueries.every(({ isSuccess }) => isSuccess);

  const data: ThreeDModelWithRevisions[] | undefined = isFetched
    ? threeDModels.map((model, index) => {
        return {
          ...model,
          revisions: revisionQueries[index].data ?? [],
        };
      })
    : undefined;

  return { data, isFetched, isFetching, isLoading, isSuccess };
};

export type ThreeDAssetMappings = Record<number, ThreeDAssetMappingItem[]>;

export type ThreeDAssetMappingItem = Omit<AssetMapping3D, 'assetId'> & {
  model: Model3D;
  revision?: Revision3D;
};

export const useThreeDAssetMappings = () => {
  const sdk = useSDK();

  const {
    data: threeDModelsWithRevisions = [],
    isFetched: didFetchThreeDModelsWithRevisions,
  } = useThreeDModelsWithRevisions();

  const assetMappingQueries = useQueries(
    threeDModelsWithRevisions?.map(({ id: modelId, revisions }) => {
      const revisionId: number | undefined = !!revisions[0]
        ? revisions[0].id
        : undefined;

      return {
        queryKey: getAssetMappingsQueryKey(modelId, revisionId),
        queryFn: () => {
          if (revisionId) {
            return sdk.assetMappings3D
              .list(modelId, revisionId)
              .autoPagingToArray({ limit: -1 });
          }
          return [];
        },
      };
    })
  );

  const isFetched =
    didFetchThreeDModelsWithRevisions &&
    assetMappingQueries.every(({ isFetched }) => isFetched);
  const isFetching = assetMappingQueries.some(({ isFetching }) => isFetching);
  const isLoading = assetMappingQueries.some(({ isLoading }) => isLoading);
  const isSuccess = assetMappingQueries.every(({ isSuccess }) => isSuccess);

  const data: ThreeDAssetMappings = useMemo(() => {
    const mappings: ThreeDAssetMappings = {};
    if (isFetched) {
      threeDModelsWithRevisions.forEach(({ revisions, ...model }, index) => {
        assetMappingQueries[index].data?.forEach(({ assetId, ...mapping }) => {
          const assetMappingItem: ThreeDAssetMappingItem = {
            ...mapping,
            model,
            revision: revisions[0] ? revisions[0] : undefined,
          };

          if (!!mappings[assetId]) {
            mappings[assetId].push(assetMappingItem);
          } else {
            mappings[assetId] = [assetMappingItem];
          }
        });
      });
    }
    return mappings;
  }, [assetMappingQueries, isFetched, threeDModelsWithRevisions]);

  return { data, isFetched, isFetching, isLoading, isSuccess };
};
