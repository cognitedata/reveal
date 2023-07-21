/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useMemo, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { useReveal } from '../RevealContainer/RevealContext';

export const HighQualityButton = (): ReactElement => {
  const viewer = useReveal();
  const [isHighQualityMode, setHighQualityMode] = useState(false);

  const toggleHighQualityMode = (): void => {
    setHighQualityMode((prevMode) => !prevMode);
  };

  useMemo(() => {
    if (isHighQualityMode) {
      return {
        pointCloudBudget: {
          numberOfPoints: 3 * viewer.pointCloudBudget.numberOfPoints
        },
        cadBudget: {
          maximumRenderCost: 3 * viewer.cadBudget.maximumRenderCost,
          highDetailProximityThreshold: viewer.cadBudget.highDetailProximityThreshold
        },
        resolutionOptions: {
          maxRenderResolution: Infinity,
          movingCameraResolutionFactor: 1
        }
      };
    } else {
      return {
        pointCloudBudget: { ...viewer.pointCloudBudget },
        cadBudget: { ...viewer.cadBudget },
        resolutionOptions: {
          maxRenderResolution: 1.4e6,
          movingCameraResolutionFactor: 1
        }
      };
    }
  }, [isHighQualityMode, viewer]);

  return (
    <Button
      onClick={toggleHighQualityMode}
      toggled={isHighQualityMode}
      icon="Settings"
      type="ghost"
      aria-label="Show settings"
    />
  );
};
