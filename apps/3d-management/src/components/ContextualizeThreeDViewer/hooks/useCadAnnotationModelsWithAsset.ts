import { useQuery } from '@tanstack/react-query';
import { uniq } from 'lodash';

import { Asset, CogniteClient, AssetMapping3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { isNotUndefined } from '@data-exploration-lib/core';

const getAssetId = (annotation: AssetMapping3D): number | undefined => {
  return annotation?.assetId ?? undefined;
};

type AnnotationModelWithAsset = {
  annotation: AssetMapping3D;
  asset: Asset | undefined;
};

const fetchAssets = async (
  annotationModels: AssetMapping3D[],
  sdk: CogniteClient
): Promise<Asset[]> => {
  const assetIds = uniq(
    annotationModels.map(getAssetId).filter(isNotUndefined)
  ).map((id) => ({ id: id }));

  return await sdk.assets.retrieve(assetIds);
};

export const useCadAnnotationModelsWithAsset = (
  annotationModels: AssetMapping3D[] | null
) => {
  const sdk = useSDK();

  const { data, error, isLoading, isError } = useQuery<Asset[], Error>(
    ['cadAnnotationModelsWithAssets', annotationModels],
    () => {
      if (annotationModels === null) return [];

      return fetchAssets(annotationModels, sdk);
    },
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,

      enabled: !(annotationModels === null || annotationModels.length === 0),
    }
  );

  const result: AnnotationModelWithAsset[] | undefined = annotationModels
    ?.map((annotation) => ({
      annotation,
      asset: data?.find((asset) => asset.id === getAssetId(annotation)),
    }))
    .sort((a, b) => {
      if (a.asset === undefined) return -1;
      if (b.asset === undefined) return 1;

      return a.asset.name.localeCompare(b.asset.name);
    });

  return {
    data: result,
    isLoading,
    isError,
    error,
  };
};
