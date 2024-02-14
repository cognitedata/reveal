/*!
 * Copyright 2023 Cognite AS
 */

import { useReveal } from '../components/RevealContainer/RevealContext';
import {
  type Cognite3DViewer,
  type AssetAnnotationImage360Info,
  type Image360Collection
} from '@cognite/reveal';
import { type Reveal360AnnotationAssetData } from './types';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type CogniteClient, type Asset } from '@cognite/sdk';
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { chunk } from 'lodash';

export const useReveal360ImageAnnotationAssets = (): UseQueryResult<
  Reveal360AnnotationAssetData[]
> => {
  const sdk = useSDK();
  const reveal = useReveal();

  return useQuery(
    ['reveal', 'react-components', 'reveal-assets-mapped-360-annotations'],
    async () => {
      const revealAnnotationAssets = await getReveal360Annotations(sdk, reveal);
      return revealAnnotationAssets;
    },
    {
      staleTime: Infinity
    }
  );
};

export const useImage360AnnotationMappingsForAssetIds = (
  assetIds: Array<string | number> | undefined
): UseQueryResult<Reveal360AnnotationAssetData[]> => {
  const { data: revealAnnotationAssets, isFetched } = useReveal360ImageAnnotationAssets();

  return useQuery(
    [
      'reveal',
      'react-components',
      'image360-annotations-mappings',
      ...(assetIds?.map((assetId) => assetId.toString()).sort() ?? [])
    ],
    async () => {
      if (assetIds === undefined || assetIds.length === 0) {
        return [];
      }
      return revealAnnotationAssets?.filter((revealAnnotationAsset) => {
        return assetIds.includes(revealAnnotationAsset.asset.id);
      });
    },
    {
      staleTime: Infinity,
      enabled: assetIds !== undefined && revealAnnotationAssets !== undefined && isFetched
    }
  );
};

export const useSearchReveal360ImageAnnotationAssets = (
  query: string
): UseQueryResult<Reveal360AnnotationAssetData[]> => {
  const { data: revealAnnotationAssets, isFetched } = useReveal360ImageAnnotationAssets();
  return useQuery(
    ['reveal', 'react-components', 'search-reveal-assets-mapped-360-annotations', query],
    async () => {
      if (query === '') {
        return revealAnnotationAssets;
      }
      const filteredSearchedAssets =
        revealAnnotationAssets?.filter((revealAnnotationAsset) => {
          const isInName = revealAnnotationAsset.asset.name
            .toLowerCase()
            .includes(query.toLowerCase());
          const isInDescription = revealAnnotationAsset.asset.description
            ?.toLowerCase()
            .includes(query.toLowerCase());

          return isInName || isInDescription;
        }) ?? [];

      return filteredSearchedAssets;
    },
    {
      staleTime: Infinity,
      enabled: isFetched && revealAnnotationAssets !== undefined
    }
  );
};

async function getReveal360Annotations(
  sdk: CogniteClient,
  reveal: Cognite3DViewer
): Promise<
  Array<{
    asset: Asset;
    assetAnnotationImage360Info: AssetAnnotationImage360Info;
  }>
> {
  const image360Collections = reveal.get360ImageCollections();

  const annotationsInfoPromise = await Promise.all(
    image360Collections.map(async (image360Collection: Image360Collection) => {
      const annotations = await image360Collection.getAnnotationsInfo('assets');
      return annotations;
    })
  );

  const annotationsInfo = annotationsInfoPromise.flat();

  const filteredAssetIds = new Set<string | number>();

  annotationsInfo.forEach((annotation) => {
    const assetId =
      annotation.annotationInfo.data.assetRef?.id ??
      annotation.annotationInfo.data.assetRef?.externalId;

    if (assetId !== undefined) {
      filteredAssetIds.add(assetId);
    }
  });

  const assets = await getAssets(sdk, Array.from(filteredAssetIds));

  const assetsWithAnnotations = annotationsInfo
    .map((annotationInfo) => {
      const asset = assets.find(
        (asset) =>
          asset.id === annotationInfo.annotationInfo.data.assetRef?.id ||
          asset.externalId === annotationInfo.annotationInfo.data.assetRef?.externalId
      );

      return {
        asset,
        assetAnnotationImage360Info: annotationInfo
      };
    })
    .filter(
      (
        item
      ): item is { asset: Asset; assetAnnotationImage360Info: AssetAnnotationImage360Info } => {
        return item.asset !== undefined;
      }
    );

  return assetsWithAnnotations;
}

async function getAssets(sdk: CogniteClient, assetIds: Array<string | number>): Promise<Asset[]> {
  const assets = await Promise.all(
    chunk(assetIds, 1000).map(async (assetsChunk) => {
      const retrievedAssets = await sdk.assets.retrieve(
        assetsChunk.map((assetId) => {
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
