/*!
 * Copyright 2024 Cognite AS
 */
import { type Cognite3DViewer, type Image360Collection } from '@cognite/reveal';
import { type AnnotationIdStylingGroup } from '../components/Image360CollectionContainer/useApply360AnnotationStyling';
import {
  type DefaultResourceStyling,
  type Image360AssetStylingGroup
} from '../components/Reveal3DResources/types';
import { useEffect, useState } from 'react';
import { useReveal } from '../components/RevealCanvas/ViewerContext';
import { type Color } from 'three';

export type StyledImage360Collection = {
  imageCollection: Image360Collection;
  styleGroups: AnnotationIdStylingGroup[];
};

export const useCalculateImage360Styling = (
  instanceGroups: Image360AssetStylingGroup[],
  defaultResourceStyling?: DefaultResourceStyling
): StyledImage360Collection[] => {
  const viewer = useReveal();
  const [mappedInstanceGroups, setMappedInstanceGroups] = useState<StyledImage360Collection[]>([]);
  const [mappedStyleGroups, setMappedStyleGroups] = useState<StyledImage360Collection[]>([]);

  useCalculateMappedStylingGroups(viewer, defaultResourceStyling?.image360?.mapped)
    .then(setMappedStyleGroups)
    .catch((error) => {
      console.warn('Error occurred while mapping styling groups:', error);
    });

  useEffect(() => {
    const imageCollections = viewer?.get360ImageCollections() ?? [];
    getMappedStylingGroups(imageCollections, instanceGroups)
      .then(setMappedInstanceGroups)
      .catch((error) => {
        console.warn('Error occurred while mapping styling groups:', error);
      });
  }, [viewer, instanceGroups]);

  return [...mappedStyleGroups, ...mappedInstanceGroups];
};

async function useCalculateMappedStylingGroups(
  viewer: Cognite3DViewer,
  color: Color | undefined
): Promise<StyledImage360Collection[]> {
  if (color === undefined) {
    return [];
  }
  const imageCollections = viewer?.get360ImageCollections() ?? [];
  const annotationsInfoPromise = imageCollections.map(
    async (imageCollection: Image360Collection) => {
      const assets = await imageCollection.getAnnotationsInfo('assets');
      const assetIds = assets
        .map((asset) => {
          return (
            asset.annotationInfo.data.assetRef.id ?? asset.annotationInfo.data.assetRef.externalId
          );
        })
        .filter((assetId): assetId is string | number => assetId !== undefined)
        .map((assetId) => +assetId);
      if (assetIds.length === 0) {
        return undefined;
      }
      return { imageCollection, styleGroups: [{ assetIds, style: color }] };
    }
  );

  const mappedStylingGroup = await Promise.all(annotationsInfoPromise);
  const filteredMappedStylingGroup = mappedStylingGroup.filter(
    (group): group is StyledImage360Collection => group !== undefined
  );
  return filteredMappedStylingGroup;
}

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
