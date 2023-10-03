/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { useReveal } from '../RevealContainer/RevealContext';
import { type Image360Collection } from '@cognite/reveal';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { type AddImageCollection360Options } from '../..';
import { useLayersUrlParams } from '../../hooks/useUrlStateParam';

type Image360CollectionContainerProps = {
  siteId: string;
  onLoad?: (image360: Image360Collection) => void;
  onLoadError?: (addOptions: AddImageCollection360Options, error: any) => void;
};

export function Image360CollectionContainer({
  siteId,
  onLoad,
  onLoadError
}: Image360CollectionContainerProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const modelRef = useRef<Image360Collection>();
  const viewer = useReveal();
  const [layersState] = useLayersUrlParams();
  const { image360Layers } = layersState;

  useEffect(() => {
    void add360Collection();
    return remove360Collection;
  }, [siteId]);

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
        errorReportFunction({ siteId }, error);
      });

    async function getOrAdd360Collection(): Promise<Image360Collection> {
      const collections = viewer.get360ImageCollections();
      const collection = collections.find((collection) => collection.id === siteId);
      if (collection !== undefined) {
        return collection;
      }

      return await viewer.add360ImageSet(
        'events',
        { site_id: siteId },
        { preMultipliedRotation: false }
      );
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
    image360Layers.forEach((layer) => {
      if (layer.siteId === image360Collection.id) {
        image360Collection.setIconsVisibility(layer.applied);
      }
    });
  }
}

function defaultLoadErrorHandler(addOptions: AddImageCollection360Options, error: any): void {
  console.warn(`Failed to load image collection ${addOptions.siteId}: ${JSON.stringify(error)}`);
}
