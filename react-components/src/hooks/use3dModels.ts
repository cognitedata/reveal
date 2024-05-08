/*!
 * Copyright 2024 Cognite AS
 */

import { useMemo } from 'react';
import { useReveal3DResourcesCount } from '../components/Reveal3DResources/Reveal3DResourcesCountContext';
import { type CogniteModel } from '@cognite/reveal';
import { useReveal } from '../components/RevealCanvas/ViewerContext';

export const use3dModels = (): CogniteModel[] => {
  const viewer = useReveal();
  const { reveal3DResourcesCount: resourceCount } = useReveal3DResourcesCount();

  return useMemo(() => {
    return viewer.models;
  }, [viewer, resourceCount]);
};
