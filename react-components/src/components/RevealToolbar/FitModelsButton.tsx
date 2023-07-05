/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useCallback } from 'react';

import { Box3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';
import { RevealToolbarButton } from './RevealToolbarButton';

export const FitModelsButton = (): ReactElement => {
  const viewer = useReveal();

  const modelList = viewer.models;

  const updateCamera = useCallback(() => {
    const box = new Box3();

    viewer.models.forEach((model) => box.union(model.getModelBoundingBox()));

    viewer.cameraManager.fitCameraToBoundingBox(box);
  }, [viewer, ...modelList]);

  return (
    <RevealToolbarButton
      icon="ExpandAlternative"
      aria-label="Fit camera to models"
      onClick={updateCamera}
    />
  );
};
