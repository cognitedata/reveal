/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback } from 'react';

import { Box3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';
import { Button } from '@cognite/cogs.js';

export const FitModelsButton = (): ReactElement => {
  const viewer = useReveal();

  const updateCamera = useCallback(() => {
    const box = new Box3();

    viewer.models.forEach((model) => box.union(model.getModelBoundingBox()));

    viewer.cameraManager.fitCameraToBoundingBox(box);
  }, [viewer, ...viewer.models]);

  return (
    <Button
      type="ghost"
      icon="ExpandAlternative"
      aria-label="Fit camera to models"
      onClick={updateCamera}
    />
  );
};
