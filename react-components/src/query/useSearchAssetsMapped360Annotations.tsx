/*!
 * Copyright 2023 Cognite AS
 */

import {
  type AnnotationFilterProps,
  type FileFilterProps,
  type Asset,
  type CogniteClient,
  type AnnotationModel
} from '@cognite/sdk';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { chunk, uniqBy } from 'lodash';
import { isDefined } from '../utilities/isDefined';
import { getAssetIdOrExternalIdFromImage360Annotation } from '../components/CacheProvider/utils';
import { type Image360AnnotationMappedAssetData } from '../hooks/types';
import { is360ImageAnnotation } from '../utilities/is360ImageAnnotation';

export const useAllAssetsMapped360Annotations = (
  sdk: CogniteClient,
  siteIds: string[]
): UseQueryResult<Image360AnnotationMappedAssetData[]> => {
  return useQuery({
    queryKey: ['reveal', 'react-components', 'all-assets-mapped-360-annotations', siteIds],
    queryFn: async () => {
      const assetMappings = await getAssetsMapped360Annotations(sdk, siteIds);
      return assetMappings;
    },
    staleTime: Infinity
  });
};

export const useSearchAssetsMapped360Annotations = (
  siteIds: string[],
  sdk: CogniteClient,
  query: string
): UseQueryResult<Image360AnnotationMappedAssetData[]> => {
  const { data: assetAnnotationMappings, isFetched } = useAllAssetsMapped360Annotations(
    sdk,
    siteIds
  );

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-assets-mapped-360-annotations',
      query,
      siteIds
    ],
    queryFn: async () => {
      if (query === '') {
        return assetAnnotationMappings;
      }

      const assetMappings = assetAnnotationMappings?.map((mapping) => mapping.asset) ?? [];

      const filteredSearchedAssets =
        assetMappings?.filter((asset) => {
          const isInName = asset.name.toLowerCase().includes(query.toLowerCase());
          const isInDescription = asset.description?.toLowerCase().includes(query.toLowerCase());

          return isInName || isInDescription;
        }) ?? [];

      const filteredAssetAnnotationMappings =
        assetAnnotationMappings?.filter((mapping) =>
          filteredSearchedAssets.includes(mapping.asset)
        ) ?? [];

      return filteredAssetAnnotationMappings;
    },
    staleTime: Infinity,
    enabled: isFetched && assetAnnotationMappings !== undefined
  });
};

async function getAssetsMapped360Annotations(
  sdk: CogniteClient,
  siteIds: string[]
): Promise<Image360AnnotationMappedAssetData[]> {
  const fileIdsList = await get360ImagesFileIds(siteIds, sdk);
  const image360Annotations = await get360ImageAnnotations(fileIdsList, sdk);
  const result = await get360AnnotationAssets(image360Annotations, sdk);

  return result;
}

async function get360AnnotationAssets(
  image360Annotations: AnnotationModel[],
  sdk: CogniteClient
): Promise<Image360AnnotationMappedAssetData[]> {
  const filteredAnnotationMappings = image360Annotations
    .map((annotation) => {
      const assetId = getAssetIdOrExternalIdFromImage360Annotation(annotation);
      if (assetId === undefined) {
        return undefined;
      }
      return {
        assetId,
        annotationId: annotation.id
      };
    })
    .filter(isDefined);

  const uniqueAnnotationMapping = uniqBy(filteredAnnotationMappings, 'assetId');

  const assets = await retrieveAssets(sdk, uniqueAnnotationMapping);
  const flatAssets = assets.flat();
  return getAssetsWithAnnotations(flatAssets, filteredAnnotationMappings);
}

async function retrieveAssets(
  sdk: CogniteClient,
  annotationMapping: Array<{ assetId: string | number; annotationId: number }>
): Promise<Asset[][]> {
  return await Promise.all(
    chunk(annotationMapping, 1000).map(async (mappingChunk) => {
      const retrievedAssets = await sdk.assets.retrieve(
        mappingChunk.map((mapping) => {
          const assetId = mapping.assetId;
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
}

function getAssetsWithAnnotations(
  flatAssets: Asset[],
  annotationMapping: Array<{ assetId: string | number; annotationId: number }>
): Array<{ asset: Asset; annotationIds: number[] }> {
  const flatAssetsWithAnnotations: Array<{ asset: Asset; annotationIds: number[] }> = [];

  flatAssets.forEach((asset) => {
    const matchingMapping = annotationMapping.find((mapping) => {
      const assetId = mapping.assetId;
      if (typeof assetId === 'number') {
        return asset.id === assetId;
      } else {
        return asset.externalId === assetId;
      }
    });

    if (matchingMapping !== undefined) {
      const matchedAssetWithAnnotation = flatAssetsWithAnnotations.find(
        (entry) => entry.asset.id === asset.id
      );

      if (matchedAssetWithAnnotation !== undefined) {
        matchedAssetWithAnnotation.annotationIds.push(matchingMapping.annotationId);
      } else {
        flatAssetsWithAnnotations.push({
          asset,
          annotationIds: [matchingMapping.annotationId]
        });
      }
    }
  });

  return flatAssetsWithAnnotations;
}

async function get360ImagesFileIds(siteIds: string[], sdk: CogniteClient): Promise<number[]> {
  const fileIdListPromises = siteIds.map(async (siteId) => {
    const req: FileFilterProps = {
      metadata: { site_id: siteId }
    };
    const fileIds = await listFileIds(req, sdk);
    return fileIds;
  });

  const fileIdsList = (await Promise.all(fileIdListPromises)).flat();

  return fileIdsList;
}

async function get360ImageAnnotations(
  fileIdsList: number[],
  sdk: CogniteClient
): Promise<AnnotationModel[]> {
  const annotationArray = await Promise.all(
    chunk(fileIdsList, 1000).map(async (fileIdsChunk) => {
      const filter: AnnotationFilterProps = {
        annotatedResourceIds: fileIdsChunk.map((id) => ({ id })),
        annotatedResourceType: 'file',
        annotationType: 'images.AssetLink'
      };
      const annotations = await sdk.annotations
        .list({
          filter,
          limit: 1000
        })
        .autoPagingToArray({ limit: Infinity });

      const filteredAnnotations = annotations.filter((annotation) =>
        is360ImageAnnotation(annotation.data)
      );
      return filteredAnnotations;
    })
  );

  return annotationArray.flatMap((annotations) => annotations);
}

async function listFileIds(filter: FileFilterProps, sdk: CogniteClient): Promise<number[]> {
  const req = { filter, limit: 1000 };
  const map = await sdk.files.list(req).autoPagingToArray({ limit: Infinity });

  const fileInfo = await Promise.all(map.flat());
  const list = fileInfo.map((file) => file.id);

  return list;
}
