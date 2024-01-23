/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { useReveal } from '../RevealContainer/RevealContext';
import { type Image360Collection } from '@cognite/reveal';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { type AddImageCollection360Options } from '../..';
import { useLayersUrlParams } from '../RevealToolbar/hooks/useUrlStateParam';

type Image360CollectionContainerProps = {
  collectionId: { siteId: string } | { externalId: string; space: string };
  onLoad?: (image360: Image360Collection) => void;
  onLoadError?: (addOptions: AddImageCollection360Options, error: any) => void;
};

export function Image360CollectionContainer({
  collectionId,
  onLoad,
  onLoadError
}: Image360CollectionContainerProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const modelRef = useRef<Image360Collection>();
  const viewer = useReveal();
  const [layersUrlState] = useLayersUrlParams();
  const { image360Layers } = layersUrlState;

  const initializingSiteId = useRef<{ siteId: string } | { externalId: string } | undefined>(
    undefined
  );

  useEffect(() => {
    if ('siteId' in collectionId && initializingSiteId.current === collectionId) {
      return;
    }

    initializingSiteId.current = collectionId;

    void add360Collection();
    return remove360Collection;
  }, [collectionId]);

  return <></>;

  async function add360Collection(): Promise<void> {
    await getOrAdd360Collection()
      .then((image360Collection) => {
        modelRef.current = image360Collection;
        onLoad?.(image360Collection);
        applyLayersState(image360Collection);
      })
      .catch((error: any) => {
        const errorReportFunction = onLoadError ?? defaultLoadErrorHandler;
        errorReportFunction(collectionId, error);
      });

    async function getOrAdd360Collection(): Promise<Image360Collection> {
      const collections = viewer.get360ImageCollections();
      const siteId = 'siteId' in collectionId ? collectionId.siteId : collectionId.externalId;
      const collection = collections.find((collection) => collection.id === siteId);
      if (collection !== undefined) {
        return collection;
      }

      if ('siteId' in collectionId) {
        return await viewer.add360ImageSet(
          'events',
          { site_id: siteId },
          { preMultipliedRotation: false }
        );
      } else {
        return await viewer.add360ImageSet('datamodels', {
          image360CollectionExternalId: collectionId.externalId,
          space: collectionId.space
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

  function applyLayersState(image360Collection: Image360Collection): void {
    if (image360Layers === undefined) {
      return;
    }
    const urlLayerState = image360Layers.find((layer) => layer.siteId === image360Collection.id);
    urlLayerState !== undefined && image360Collection.setIconsVisibility(urlLayerState.applied);
  }
}

function defaultLoadErrorHandler(addOptions: AddImageCollection360Options, error: any): void {
  console.warn(
    `Failed to load image collection ${
      'siteId' in addOptions ? addOptions.siteId : addOptions.externalId
    }: ${JSON.stringify(error)}`
  );
}
