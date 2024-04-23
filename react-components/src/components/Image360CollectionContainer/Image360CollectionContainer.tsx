/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { type Image360Collection } from '@cognite/reveal';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { type AddImageCollection360Options } from '../..';
import {
  type ImageCollectionModelStyling,
  useApply360AnnotationStyling
} from './useApply360AnnotationStyling';
import { type Matrix4 } from 'three';

type Image360CollectionContainerProps = {
  addImageCollection360Options: AddImageCollection360Options;
  styling?: ImageCollectionModelStyling;
  onLoad?: (image360: Image360Collection) => void;
  onLoadError?: (addOptions: AddImageCollection360Options, error: any) => void;
};

export function Image360CollectionContainer({
  addImageCollection360Options,
  styling,
  onLoad,
  onLoadError
}: Image360CollectionContainerProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const modelRef = useRef<Image360Collection>();
  const viewer = useReveal();

  const initializingSiteId = useRef<{ siteId: string } | { externalId: string } | undefined>(
    undefined
  );

  useEffect(() => {
    if (
      'siteId' in addImageCollection360Options &&
      initializingSiteId.current === addImageCollection360Options
    ) {
      return;
    }

    initializingSiteId.current = addImageCollection360Options;

    void add360Collection(addImageCollection360Options.transform);
    return remove360Collection;
  }, [addImageCollection360Options]);

  useApply360AnnotationStyling(modelRef.current, styling);

  useEffect(() => {
    if (
      modelRef.current === undefined ||
      addImageCollection360Options.transform === undefined ||
      !viewer.get360ImageCollections().includes(modelRef.current)
    ) {
      return;
    }

    modelRef.current.setModelTransformation(addImageCollection360Options.transform);
  }, [modelRef, addImageCollection360Options.transform, viewer]);

  return <></>;

  async function add360Collection(transform?: Matrix4): Promise<void> {
    await getOrAdd360Collection()
      .then((image360Collection) => {
        if (transform !== undefined) {
          image360Collection.setModelTransformation(transform);
        }

        modelRef.current = image360Collection;
        onLoad?.(image360Collection);
      })
      .catch((error: any) => {
        const errorReportFunction = onLoadError ?? defaultLoadErrorHandler;
        errorReportFunction(addImageCollection360Options, error);
      });

    async function getOrAdd360Collection(): Promise<Image360Collection> {
      const collections = viewer.get360ImageCollections();
      const siteId =
        'siteId' in addImageCollection360Options
          ? addImageCollection360Options.siteId
          : addImageCollection360Options.externalId;
      const collection = collections.find((collection) => collection.id === siteId);
      if (collection !== undefined) {
        return collection;
      }

      if ('siteId' in addImageCollection360Options) {
        return await viewer.add360ImageSet(
          'events',
          { site_id: siteId },
          { preMultipliedRotation: false }
        );
      } else {
        return await viewer.add360ImageSet('datamodels', {
          image360CollectionExternalId: addImageCollection360Options.externalId,
          space: addImageCollection360Options.space
        });
      }
    }
  }

  function remove360Collection(): void {
    if (modelRef.current === undefined) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    viewer.remove360ImageSet(modelRef.current);
    modelRef.current = undefined;
  }
}

function defaultLoadErrorHandler(addOptions: AddImageCollection360Options, error: any): void {
  console.warn(
    `Failed to load image collection ${
      'siteId' in addOptions ? addOptions.siteId : addOptions.externalId
    }: ${JSON.stringify(error)}`
  );
}
