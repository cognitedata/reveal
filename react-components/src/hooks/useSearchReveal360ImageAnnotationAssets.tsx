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
import { type Asset } from '@cognite/sdk';
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { chunk } from 'lodash';

export const useReveal360ImageAnnotationAssets = (): UseQueryResult<
  Reveal360AnnotationAssetData[]
> => {
  const reveal = useReveal();

  return useQuery(
    ['reveal', 'react-components', 'reveal-assets-mapped-360-annotations'],
    async () => {
      const revealAnnotationAssets = await getReveal360Annotations(reveal);
      return revealAnnotationAssets;
    },
    {
      staleTime: Infinity
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

async function getReveal360Annotations(reveal: Cognite3DViewer): Promise<
  Array<{
    asset: Asset;
    annotation: AssetAnnotationImage360Info;
  }>
> {
  const image30Collections = reveal.get360ImageCollections();
  const annotationsInfo: AssetAnnotationImage360Info[] = [];
  image30Collections.map(async (image360Collection: Image360Collection): Promise<void> => {
    const annotations = await image360Collection.getAnnotationsInfo('assets');
    annotationsInfo.push(...annotations);
  });

  const assetIds = annotationsInfo.flatMap((annotation) =>
    [
      annotation.annotationInfo.data.assetRef?.id,
      annotation.annotationInfo.data.assetRef?.externalId
    ].filter((id) => id !== undefined)
  );

  const assets = await getAssets(assetIds);
  const assetsWithAnnotations = matchAssetsWithAnnotations(assets, annotationsInfo);

  return assetsWithAnnotations;
}

async function getAssets(assetIds: Array<string | number>): Promise<Asset[]> {
  const sdk = useSDK();
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

function matchAssetsWithAnnotations(
  assets: Asset[],
  annotationsInfo: AssetAnnotationImage360Info[]
): Array<{
  asset: Asset;
  annotation: AssetAnnotationImage360Info;
}> {
  return annotationsInfo
    .map((annotationInfo: AssetAnnotationImage360Info | undefined) => {
      const asset = assets.find(
        (asset) =>
          asset.id === annotationInfo?.annotationInfo.data.assetRef?.id ||
          asset.externalId === annotationInfo?.annotationInfo.data.assetRef?.externalId
      );

      if (asset !== undefined) {
        return { asset, annotation: annotationInfo };
      }
      return null;
    })
    .filter(
      (item: { asset: Asset; annotation: AssetAnnotationImage360Info } | null) => item !== null
    ) as Array<{
    asset: Asset;
    annotation: AssetAnnotationImage360Info;
  }>;
}
