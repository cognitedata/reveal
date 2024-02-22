/*!
 * Copyright 2024 Cognite AS
 */

import {
  type Cognite3DViewer,
  type Image360Collection,
  type Image360Annotation
} from '@cognite/reveal';
import { Color } from 'three';
import { image360CollectionExists } from '../../utilities/modelExists';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type CogniteInternalId } from '@cognite/sdk';
import { useReveal } from '../RevealCanvas/ViewerContext';

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
  const [lastStyledImageAnnotations, setLastStyledImageAnnotations] = useState<
    Image360Annotation[]
  >([]);

  const abortController = useRef(new AbortController());

  const defaultStyle = styling?.defaultStyle ?? new Color(0xffffff);
  const styleGroups = styling?.groups;

  const enableAnnotationStyling = useCallback(() => {
    if (imageCollection === undefined) return;
    lastStyledImageAnnotations.forEach((a) => {
      a.setColor(undefined);
    });
    setLastStyledImageAnnotations([]);
    imageCollection.setDefaultAnnotationStyle({
      color: defaultStyle,
      visible: true
    });
    viewer.requestRedraw();
  }, [viewer, defaultStyle]);

  useEffect(() => {
    if (imageCollection === undefined) return;
    imageCollection.on('image360Entered', enableAnnotationStyling);

    return () => {
      imageCollection.off('image360Entered', enableAnnotationStyling);
    };
  }, [viewer, imageCollection]);

  useEffect(() => {
    if (!image360CollectionExists(imageCollection, viewer) || styleGroups === undefined) return;

    if (styleGroups.length === 0) {
      enableAnnotationStyling();
      abortController.current.abort();
      abortController.current = new AbortController();
    } else {
      void applyStyling(
        imageCollection,
        styleGroups,
        viewer,
        enableAnnotationStyling,
        setLastStyledImageAnnotations,
        abortController.current.signal
      );
    }
  }, [styleGroups, imageCollection]);
};

async function applyStyling(
  imageCollection: Image360Collection,
  styling: AnnotationIdStylingGroup[],
  viewer: Cognite3DViewer,
  enableAnnotationStyling: () => void,
  setLastStyledImageAnnotations: (annotations: Image360Annotation[]) => void,
  signal: AbortSignal
): Promise<void> {
  if (styling === undefined || styling.length === 0) return;

  for (const group of styling) {
    if (group.assetIds !== undefined) {
      const annotationInfoPromise = group.assetIds.map(async (id) => {
        return await imageCollection.findImageAnnotations({
          assetRef: { id: group.assetIds[0] }
        });
      });
      const annotationInfo = (await Promise.all(annotationInfoPromise)).flat();

      if (annotationInfo.length === 0 || signal.aborted) {
        return;
      }
      enableAnnotationStyling();

      annotationInfo.forEach((info) => {
        info.annotation.setColor(new Color('rgb(150, 150, 242)'));
      });
      setLastStyledImageAnnotations(annotationInfo.map((i) => i.annotation));

      viewer.requestRedraw();
    }
  }
}
