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
    add360Collection().catch(console.error);
    return remove360Collection;
  }, [siteId]);

  return <></>;

  async function add360Collection(): Promise<void> {
    const image360Collection = await viewer.add360ImageSet('events', { site_id: siteId });
    modelRef.current = image360Collection;
    onLoad?.();
  }

  function remove360Collection(): void {
    if (modelRef.current === undefined) return;
    viewer.remove360ImageSet(modelRef.current);
    modelRef.current = undefined;
  }
}
