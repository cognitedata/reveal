import { useQuery } from '@tanstack/react-query';
import { uniq } from 'lodash';

import {
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  AnnotationModel,
  Asset,
  CogniteClient,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { isNotUndefined } from '@data-exploration-lib/core';

const getAssetId = (annotation: AnnotationModel): number | undefined => {
  return (
    (annotation.data as AnnotationsCogniteAnnotationTypesImagesAssetLink)
      ?.assetRef?.id ?? undefined
  );
};

type AnnotationModelWithAsset = {
  annotation: AnnotationModel;
  asset?: Asset;
};

const fetchAssets = async (
  annotationModels: AnnotationModel[],
  sdk: CogniteClient
): Promise<Asset[]> => {
  const assetIds = uniq(
    annotationModels.map(getAssetId).filter(isNotUndefined)
  ).map((id) => ({ id: id }));

  return await sdk.assets.retrieve(assetIds);
};

export const useAnnotationModelsWithAsset = (
  annotationModels: AnnotationModel[] | null
) => {
  const sdk = useSDK();

  const { data, error, isLoading, isError } = useQuery<Asset[], Error>(
    ['annotationModelsWithAssets', annotationModels],
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
