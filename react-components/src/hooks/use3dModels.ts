/*!
 * Copyright 2024 Cognite AS
 */

import { useMemo } from 'react';
import { useReveal } from '..';
import { useReveal3DResourcesCount } from '../components/Reveal3DResources/Reveal3DResourcesCountContext';
import { CogniteModel } from '@cognite/reveal';

export const use3dModels = (): CogniteModel[] => {
  const viewer = useReveal();
  const resourceCount = useReveal3DResourcesCount();

  return useMemo(() => {
    return viewer.models;
  }, [viewer, resourceCount]);
};
