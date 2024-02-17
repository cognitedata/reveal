/*!
 * Copyright 2024 Cognite AS
 */

import {
  type Cognite3DViewer,
  type Image360Annotation,
  type Image360Collection
} from '@cognite/reveal';
import { Color } from 'three';
import { useReveal } from '../RevealContainer/RevealContext';
import { image360CollectionExists } from '../../utilities/modelExists';
import { useEffect } from 'react';
import { type CogniteInternalId } from '@cognite/sdk';

export type AnnotationIdStylingGroup = {
  assetIds: CogniteInternalId[];
  style: Color;
};

export type ImageCollectionModelStyling = {
  defaultStyle?: Color;
  groups?: AnnotationIdStylingGroup[];
};

export const useApply360AnnotationStyling = (
  imageCollection: Image360Collection,
  styling: ImageCollectionModelStyling
): void => {
  const viewer = useReveal();
  const lastStyledImageAnnotations: Image360Annotation[] = [];

  const defaultStyle = styling?.defaultStyle ?? new Color(0xffffff);
  const styleGroups = styling?.groups;

  useEffect(() => {
    if (!image360CollectionExists(imageCollection, viewer) || styleGroups === undefined) return;

    void applyStyling(imageCollection, styleGroups, lastStyledImageAnnotations, viewer);
  }, [styleGroups, imageCollection]);

  useEffect(() => {
    if (!image360CollectionExists(imageCollection, viewer)) return;

    viewer.get360ImageCollections().forEach((collection) => {
      collection.setDefaultAnnotationStyle({
        color: undefined,
        visible: undefined
      });
    });

    // lastStyledImageAnnotations.forEach((a) => {
    //   a.setColor(undefined);
    // });
    // lastStyledImageAnnotations = [];
    viewer.requestRedraw();
  }, [defaultStyle, imageCollection]);
};

async function applyStyling(
  imageCollection: Image360Collection,
  styling: AnnotationIdStylingGroup[],
  lastStyledImageAnnotations: Image360Annotation[],
  viewer: Cognite3DViewer
): Promise<void> {
  if (styling !== undefined) {
    for (const group of styling) {
      if (group.assetId !== undefined) {
        const annotationInfo = await imageCollection.findImageAnnotations({
          assetRef: { id: group.assetId }
        });

        if (annotationInfo.length === 0) {
          return;
        }

        annotationInfo.forEach((info) => {
          info.annotation.setColor(new Color('rgb(150, 150, 242)'));
        });

        // lastStyledImageAnnotations = annotationInfo.map((i) => i.annotation);
        viewer.requestRedraw();
      }
    }
  }
}
