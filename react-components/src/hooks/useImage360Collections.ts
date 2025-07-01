import { useMemo } from 'react';
import { useReveal } from '../components/RevealCanvas/ViewerContext';
import { type DataSourceType, type Image360Collection } from '@cognite/reveal';
import { useReveal3DResourcesCount } from '../components/Reveal3DResources/Reveal3DResourcesInfoContext';

export const useImage360Collections = (): Array<Image360Collection<DataSourceType>> => {
  const viewer = useReveal();
  const { reveal3DResourcesCount: resourceCount } = useReveal3DResourcesCount();

  return useMemo(() => {
    return viewer.get360ImageCollections();
  }, [viewer, resourceCount]);
};
