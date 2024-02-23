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
import { chunk, uniq } from 'lodash';
import { getAssetIdOrExternalIdFromImage360Annotation } from '../components/NodeCacheProvider/utils';

export const useAllAssetsMapped360Annotations = (
  sdk: CogniteClient,
  siteIds: string[]
): UseQueryResult<Asset[]> => {
  return useQuery(
    ['reveal', 'react-components', 'all-assets-mapped-360-annotations', siteIds],
    async () => {
      const assetMappings = await getAssetsMapped360Annotations(sdk, siteIds);
      return assetMappings;
    },
    {
      staleTime: Infinity
    }
  );
};

export const useSearchAssetsMapped360Annotations = (
  siteIds: string[],
  sdk: CogniteClient,
  query: string
): UseQueryResult<Asset[]> => {
  const { data: assetMappings, isFetched } = useAllAssetsMapped360Annotations(sdk, siteIds);

  return useQuery(
    ['reveal', 'react-components', 'search-assets-mapped-360-annotations', query, siteIds],
    async () => {
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
    {
      staleTime: Infinity,
      enabled: isFetched && assetMappings !== undefined
    }
  );
};

async function getAssetsMapped360Annotations(
  sdk: CogniteClient,
  siteIds: string[]
): Promise<Asset[]> {
  const fileIdsList = await get360ImagesFileIds(siteIds, sdk);
  const image360Annotations = await get360ImageAnnotations(fileIdsList, sdk);
  const result = await get360AnnotationAssets(image360Annotations, sdk);

  return result;
}

async function get360AnnotationAssets(
  image360Annotations: AnnotationModel[],
  sdk: CogniteClient
): Promise<Asset[]> {
  const annotationMapping = image360Annotations
    .map((annotation) => getAssetIdOrExternalIdFromImage360Annotation(annotation))
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
      return annotations;
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
