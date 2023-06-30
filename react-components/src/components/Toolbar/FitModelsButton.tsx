/*!
 * Copyright 2023 Cognite AS
 */

import React, { useCallback, useEffect, useState } from 'react';

import { Box3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';
import { ToolbarButton } from './ToolbarButton';

export const FitModelsButton = () => {
  const viewer = useReveal();

  const modelList = viewer.models;

  const updateCamera = useCallback(() => {
    const box = new Box3();

    viewer.models.forEach((model) => box.union(model.getModelBoundingBox()));

    viewer.cameraManager.fitCameraToBoundingBox(box);
  }, [viewer, ...modelList]);

  return (
    <ToolbarButton
      icon="ExpandAlternative"
      aria-label="Fit camera to models"
      onClick={updateCamera}
    />
  );
};
