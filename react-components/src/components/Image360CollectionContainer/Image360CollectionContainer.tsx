/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { useReveal } from '../RevealContainer/RevealContext';
import { type Image360Collection } from '@cognite/reveal';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';

type Image360CollectionContainerProps = {
  siteId: string;
  onLoad?: (image360: Image360Collection) => void;
};

export function Image360CollectionContainer({
  siteId,
  onLoad
}: Image360CollectionContainerProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const modelRef = useRef<Image360Collection>();
  const viewer = useReveal();

  useEffect(() => {
    add360Collection().catch(console.error);
    return remove360Collection;
  }, [siteId]);

  return <></>;

  async function add360Collection(): Promise<void> {
    const image360Collection = await getOrAdd360Collection();
    modelRef.current = image360Collection;
    onLoad?.(image360Collection);

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
}
