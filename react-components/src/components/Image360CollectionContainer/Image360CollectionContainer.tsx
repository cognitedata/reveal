/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { useReveal } from '../RevealContainer/RevealContext';
import { type Image360Collection } from '@cognite/reveal';

type Image360CollectionContainerProps = {
  siteId: string;
  onLoad?: () => void;
};

export function Image360CollectionContainer({
  siteId,
  onLoad
}: Image360CollectionContainerProps): ReactElement {
  const modelRef = useRef<Image360Collection>();
  const viewer = useReveal();

  useEffect(() => {
    addModel().catch(console.error);
    return removeModel;
  }, [siteId]);

  return <></>;

  async function addModel(): Promise<void> {
    const image360Collection = await viewer.add360ImageSet('events', { site_id: siteId });
    modelRef.current = image360Collection;
    onLoad?.();
  }

  function removeModel(): void {
    if (modelRef.current === undefined) return;
    viewer.remove360ImageSet(modelRef.current);
    modelRef.current = undefined;
  }
}
