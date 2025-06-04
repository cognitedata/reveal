import { type AddModelOptions } from '@cognite/reveal';
import {
  type AnnotationFilterProps,
  type AnnotationsBoundingVolume,
  type Asset,
  type CogniteClient,
  type AnnotationModel
} from '@cognite/sdk';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { chunk, uniq } from 'lodash';

export const useAllAssetsMappedPointCloudAnnotations = (
  sdk: CogniteClient,
  models: AddModelOptions[]
): UseQueryResult<Asset[]> => {
  return useQuery({
    queryKey: ['reveal', 'react-components', 'all-assets-mapped-point-cloud-annotations', models],
    queryFn: async () => {
      const assetMappings = await getAssetsMappedPointCloudAnnotations(sdk, models);
      return assetMappings;
    },
    staleTime: Infinity
  });
};

export const useSearchAssetsMappedPointCloudAnnotations = (
  models: AddModelOptions[],
  sdk: CogniteClient,
  query: string
): UseQueryResult<Asset[]> => {
  const { data: assetMappings, isFetched } = useAllAssetsMappedPointCloudAnnotations(sdk, models);

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-assets-mapped-point-cloud-annotations',
      query,
      models
    ],
    queryFn: async () => {
      if (query === '') {
        return assetMappings;
      }

      const filteredSearchedAssets =
        assetMappings?.filter((asset) => {
          const isInName = asset.name.toLowerCase().includes(query.toLowerCase());
          const isInDescription = asset.description?.toLowerCase().includes(query.toLowerCase());

          return isInName || isInDescription;
        }) ?? [];

      return filteredSearchedAssets;
    },
    staleTime: Infinity,
    enabled: isFetched && assetMappings !== undefined
  });
};

async function getAssetsMappedPointCloudAnnotations(
  sdk: CogniteClient,
  models: AddModelOptions[]
): Promise<Asset[]> {
  const modelIdList = models.map((model) => model.modelId);
  const pointCloudAnnotations = await getPointCloudAnnotations(modelIdList, sdk);
  const result = await getPointCloudAnnotationAssets(pointCloudAnnotations, sdk);

  return result;
}

async function getPointCloudAnnotationAssets(
  pointCloudAnnotations: AnnotationModel[],
  sdk: CogniteClient
): Promise<Asset[]> {
  // TODO: Replace the check for assetRef similar to Point Cloud Asset Styling
  const annotationMapping = pointCloudAnnotations
    .map(
      (annotation) =>
        (annotation.data as AnnotationsBoundingVolume).assetRef?.id ??
        (annotation.data as AnnotationsBoundingVolume).assetRef?.externalId
    )
    .filter((annotation): annotation is string | number => annotation !== undefined);

  const uniqueAnnotationMapping = uniq(annotationMapping);

  const assets = await Promise.all(
    chunk(uniqueAnnotationMapping, 1000).map(async (uniqueAssetsChunk) => {
      const retrievedAssets = await sdk.assets.retrieve(
        uniqueAssetsChunk.map((assetId) => {
          if (typeof assetId === 'number') {
            return { id: assetId };
          } else {
            return { externalId: assetId };
          }
        }),
        { ignoreUnknownIds: true }
      );
      return retrievedAssets;
    })
  );

  return assets.flat();
}

async function getPointCloudAnnotations(
  modelIdList: number[],
  sdk: CogniteClient
): Promise<AnnotationModel[]> {
  const annotationArray = await Promise.all(
    chunk(modelIdList, 1000).map(async (modelIdList) => {
      const filter: AnnotationFilterProps = {
        annotatedResourceIds: modelIdList.map((id) => ({ id })),
        annotatedResourceType: 'threedmodel',
        annotationType: 'pointcloud.BoundingVolume'
      };
      const annotations = await sdk.annotations
        .list({
          filter,
          limit: 1000
        })
        .autoPagingToArray({ limit: Infinity });
      return annotations;
    })
  );

  return annotationArray.flatMap((annotations) => annotations);
}
