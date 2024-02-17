/*!
 * Copyright 2024 Cognite AS
 */
import { type Image360Collection } from '@cognite/reveal';
import { type AnnotationIdStylingGroup } from '../components/Image360CollectionContainer/useApply360AnnotationStyling';
import { type Image360AssetStylingGroup } from '../components/Reveal3DResources/types';
import { useReveal } from '../components/RevealContainer/RevealContext';
import { useMemo } from 'react';

export type StyledImage360Collection = {
  imageCollection: Image360Collection;
  styleGroups: AnnotationIdStylingGroup[];
};

export const useCalculateImage360Styling = async (
  instanceGroups: Image360AssetStylingGroup[]
): Promise<StyledImage360Collection[]> => {
  const viewer = useReveal();
  const imageCollections = useMemo(() => {
    if (viewer === undefined) {
      return [];
    }
    return viewer.get360ImageCollections();
  }, [viewer]);

  const mappedInstanceGroups = await getMappedStylingGroups(imageCollections, instanceGroups);
  return mappedInstanceGroups;
};

async function getMappedStylingGroups(
  imageCollections: Image360Collection[],
  instanceGroups: Image360AssetStylingGroup[]
): Promise<StyledImage360Collection[]> {
  const mappedStylingGroupPromise = imageCollections.map(async (imageCollection) => {
    const assets = await imageCollection.getAnnotationsInfo('assets');
    const assetIds = assets.map((asset) => {
      return asset.annotationInfo.data.assetRef.id;
    });
    const styleGroups = instanceGroups.filter((group) => {
      return group.assetIds.every((assetId) => assetIds.includes(assetId));
    });
    return { imageCollection, styleGroups };
  });
  const mappedStylingGroup = await Promise.all(mappedStylingGroupPromise);

  return mappedStylingGroup.flat();
}
