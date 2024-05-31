/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { type Image360Collection } from '@cognite/reveal';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { type AddImage360CollectionOptions } from '../Reveal3DResources/types';
import {
  type ImageCollectionModelStyling,
  useApply360AnnotationStyling
} from './useApply360AnnotationStyling';
import { type Matrix4 } from 'three';

type Image360CollectionContainerProps = {
  addImage360CollectionOptions: AddImage360CollectionOptions;
  styling?: ImageCollectionModelStyling;
  onLoad?: (image360: Image360Collection) => void;
  onLoadError?: (addOptions: AddImage360CollectionOptions, error: any) => void;
};

export function Image360CollectionContainer({
  addImage360CollectionOptions,
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
      'siteId' in addImage360CollectionOptions &&
      initializingSiteId.current === addImage360CollectionOptions
    ) {
      return;
    }

    initializingSiteId.current = addImage360CollectionOptions;

    void add360Collection(addImage360CollectionOptions.transform);
    return remove360Collection;
  }, [addImage360CollectionOptions]);

  useApply360AnnotationStyling(modelRef.current, styling);

  useEffect(() => {
    if (
      modelRef.current === undefined ||
      addImage360CollectionOptions.transform === undefined ||
      !viewer.get360ImageCollections().includes(modelRef.current)
    ) {
      return;
    }

    modelRef.current.setModelTransformation(addImage360CollectionOptions.transform);
  }, [modelRef, addImage360CollectionOptions.transform, viewer]);

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
        errorReportFunction(addImage360CollectionOptions, error);
      });

    async function getOrAdd360Collection(): Promise<Image360Collection> {
      const collections = viewer.get360ImageCollections();
      const siteId =
        'siteId' in addImage360CollectionOptions
          ? addImage360CollectionOptions.siteId
          : addImage360CollectionOptions.externalId;
      const collection = collections.find((collection) => collection.id === siteId);
      if (collection !== undefined) {
        return collection;
      }

      if ('siteId' in addImage360CollectionOptions) {
        return await viewer.add360ImageSet(
          'events',
          { site_id: siteId },
          { preMultipliedRotation: false }
        );
      } else {
        return await viewer.add360ImageSet('datamodels', {
          image360CollectionExternalId: addImage360CollectionOptions.externalId,
          space: addImage360CollectionOptions.space
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

function defaultLoadErrorHandler(addOptions: AddImage360CollectionOptions, error: any): void {
  console.warn(
    `Failed to load image collection ${
      'siteId' in addOptions ? addOptions.siteId : addOptions.externalId
    }: ${JSON.stringify(error)}`
  );
}
