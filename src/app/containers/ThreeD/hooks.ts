import {
  Asset,
  AssetMapping3D,
  IdEither,
  Model3D,
  Revision3D,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { get3dAssetMappings } from 'app/containers/ThreeD/utils';
import uniqBy from 'lodash/uniqBy';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
} from 'react-query';

export type ThreeDModelsResponse = {
  items: Model3D[];
  nextCursor?: string;
};

export type AssetMappingResponse = {
  items: Asset[];
  nextCursor?: string;
};

export const useInfinite3DModels = (
  limit?: number,
  config?: UseInfiniteQueryOptions<ThreeDModelsResponse>
) => {
  const sdk = useSDK();

  return useInfiniteQuery(
    ['cdf', 'infinite', '3d', 'models', 'list'],
    async ({ pageParam }) => {
      const models = await sdk.get<ThreeDModelsResponse>(
        `/api/v1/projects/${sdk.project}/3d/models`,
        { params: { limit: limit || 1000, cursor: pageParam } }
      );
      return models.data;
    },
    {
      getNextPageParam: r => r.nextCursor,
      ...config,
    }
  );
};

export const use3DModel = (id: number | undefined) => {
  const sdk = useSDK();

  return useQuery<Model3D>(
    ['cdf', '3d', 'model', id],
    async () => {
      const models = await sdk.get(
        `/api/v1/projects/${sdk.project}/3d/models/${id}`
      );
      return models.data;
    },
    { enabled: Boolean(id) }
  );
};

export const useDefault3DModelRevision = (id: number | undefined) => {
  const sdk = useSDK();

  return useQuery<Revision3D>(
    ['cdf', '3d', 'model', id, 'revisions'],
    async () => {
      const resp = await sdk.get(
        `/api/v1/projects/${sdk.project}/3d/models/${id}/revisions`
      );
      const revisions = (resp.data.items || []) as any[];

      // Published or latest revision
      return (
        revisions.find(r => r.published) ||
        revisions.reduce((prev, current) =>
          prev.createdTime > current.createdTime ? prev : current
        )
      );
    },
    { enabled: Boolean(id) }
  );
};

export const use3DModelThumbnail = (url?: string) => {
  const sdk = useSDK();

  return useQuery<ArrayBuffer>(
    ['cdf', '3d', 'thumbnail', url],
    async () => {
      const resp = await sdk.get(url!, {
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
        responseType: 'arraybuffer',
      });
      return resp.data;
    },
    { enabled: Boolean(url) }
  );
};

export const useInfiniteAssetMappings = (
  modelId?: number,
  revisionId?: number,
  limit?: number,
  config?: UseInfiniteQueryOptions<AssetMappingResponse>
) => {
  const sdk = useSDK();

  return useInfiniteQuery<AssetMappingResponse>(
    ['cdf', 'infinite', '3d', 'asset-mapping', modelId, revisionId],
    async ({ pageParam }) => {
      // Query asset mappings in the 3D model
      const models = await sdk.get(
        `/api/v1/projects/${sdk.project}/3d/models/${modelId}/revisions/${revisionId}/mappings`,
        { params: { limit: limit || 1000, cursor: pageParam } }
      );
      const assetMappings = models.data.items as AssetMapping3D[];
      const uniqueAssetMappings = uniqBy(assetMappings, 'assetId');

      // Query assets corresponding to the asset mappings
      const assets = await sdk.assets.retrieve(
        uniqueAssetMappings.map(({ assetId }) => ({ id: assetId })),
        { ignoreUnknownIds: true }
      );

      return { nextCursor: models.data.nextCursor, items: assets };
    },
    {
      getNextPageParam: r => r.nextCursor,
      enabled: Boolean(modelId && revisionId),
      ...config,
    }
  );
};

export const useAssetMappings = (modelId?: number, revisionId?: number) => {
  const sdk = useSDK();

  return useQuery<Asset[]>(
    ['cdf', '3d', 'asset-mapping', modelId, revisionId],
    async () => {
      const MAX_ASSET_IDS = 1000;
      const uniqueAssetIds = new Set<number>();
      let nextCursor: string = '';

      // Call the 3d asset mappings endpoint atlease once to check if we can get
      // atleast MAX_ASSET_IDS number of unquie assetIds or if we have exhausted
      // calling asset mappings data i.e, no nextCursor
      do {
        // eslint-disable-next-line no-await-in-loop
        const models = await get3dAssetMappings(
          sdk,
          modelId!,
          revisionId,
          nextCursor
        );

        nextCursor = models.data.nextCursor;
        // Iterating and inserting unique assetIds into uniqueAssetIds Set
        models.data.items.forEach(({ assetId }: { assetId: number }) =>
          uniqueAssetIds.add(assetId)
        );
      } while (nextCursor && uniqueAssetIds.size <= MAX_ASSET_IDS);

      const uniqueAssetMappings: IdEither[] = [];
      uniqueAssetIds.forEach(id => uniqueAssetMappings.push({ id }));

      // Query assets corresponding to the asset mappings
      const assets = await sdk.assets.retrieve(uniqueAssetMappings, {
        ignoreUnknownIds: true,
      });

      return assets;
    },
    { enabled: Boolean(modelId) }
  );
};
