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
import { useCallback, useEffect } from 'react';
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
  imageCollection?: Image360Collection,
  styling?: ImageCollectionModelStyling
): void => {
  const viewer = useReveal();
  let lastStyledImageAnnotations: Image360Annotation[] = [];

  const defaultStyle = styling?.defaultStyle ?? new Color(0xffffff);
  const styleGroups = styling?.groups;

  // useEffect(() => {
  //   if (!image360CollectionExists(imageCollection, viewer)) return;
  //   // console.log('resetAnnotationStyling');

  //   // resetAnnotationStyling();
  // }, [defaultStyle, imageCollection]);

  // const enableAnnotationStyling = useCallback(
  //   async (_entity: Image360, revision: Image360Revision) => {
  //     await revision.getAnnotations().then((annotations) => {
  //       annotations.forEach((annotation) => {
  //         annotation.setColor(defaultStyle);
  //       });
  //       viewer.requestRedraw();
  //     });
  //   },
  //   [viewer, defaultStyle]
  // );
  const enableAnnotationStyling = useCallback(() => {
    console.log('Image 360 entered');
    if (imageCollection === undefined) return;
    console.log('enableAnnotationStyling');
    imageCollection.setDefaultAnnotationStyle({
      color: defaultStyle,
      visible: undefined
    });
    viewer.requestRedraw();
  }, [viewer, defaultStyle]);
  const resetAnnotationStyling = useCallback(() => {
    console.log('Image 360 exited');
    if (imageCollection === undefined) return;
    console.log('resetAnnotationStyling');
    imageCollection.setDefaultAnnotationStyle({
      color: undefined,
      visible: undefined
    });
    lastStyledImageAnnotations.forEach((a) => {
      a.setColor(undefined);
    });
    lastStyledImageAnnotations = [];
    viewer.requestRedraw();
  }, [viewer]);

  useEffect(() => {
    if (imageCollection === undefined) return;
    imageCollection.on('image360Entered', enableAnnotationStyling);
    imageCollection.on('image360Exited', resetAnnotationStyling);

    return () => {
      imageCollection.off('image360Entered', enableAnnotationStyling);
      imageCollection.off('image360Exited', resetAnnotationStyling);
    };
  }, [viewer, imageCollection]);

  useEffect(() => {
    if (!image360CollectionExists(imageCollection, viewer) || styleGroups === undefined) return;

    void applyStyling(imageCollection, styleGroups, lastStyledImageAnnotations, viewer);
  }, [styleGroups, imageCollection]);
};

async function applyStyling(
  imageCollection: Image360Collection,
  styling: AnnotationIdStylingGroup[],
  lastStyledImageAnnotations: Image360Annotation[],
  viewer: Cognite3DViewer
): Promise<void> {
  if (styling !== undefined) {
    for (const group of styling) {
      if (group.assetIds !== undefined) {
        const annotationInfo = await imageCollection.findImageAnnotations({
          assetRef: { id: group.assetIds[0] }
        });

        if (annotationInfo.length === 0) {
          return;
        }

        annotationInfo.forEach((info) => {
          info.annotation.setColor(new Color('rgb(150, 150, 242)'));
        });

        lastStyledImageAnnotations = annotationInfo.map((i) => i.annotation);
        viewer.requestRedraw();
      }
    }
  }
}
