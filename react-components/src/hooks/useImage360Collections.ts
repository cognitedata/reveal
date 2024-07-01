import { useMemo } from 'react';
import { useReveal } from '../components/RevealCanvas/ViewerContext';
import { Image360Collection } from '@cognite/reveal';
import { useReveal3DResourcesCount } from '../components/Reveal3DResources/Reveal3DResourcesCountContext';

export const useImage360Collections = (): Image360Collection[] => {
  const viewer = useReveal();
  const { reveal3DResourcesCount: resourceCount } = useReveal3DResourcesCount();

  return useMemo(() => {
    return viewer.get360ImageCollections();
  }, [viewer, resourceCount]);
};
