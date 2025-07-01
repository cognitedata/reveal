import { useMemo } from 'react';
import { useReveal3DResourcesCount } from '../components/Reveal3DResources/Reveal3DResourcesInfoContext';
import { type CogniteModel, type DataSourceType } from '@cognite/reveal';
import { useReveal } from '../components/RevealCanvas/ViewerContext';

export const use3dModels = (): Array<CogniteModel<DataSourceType>> => {
  const viewer = useReveal();
  const { reveal3DResourcesCount: resourceCount } = useReveal3DResourcesCount();

  return useMemo(() => {
    return viewer.models;
  }, [viewer, resourceCount]);
};
