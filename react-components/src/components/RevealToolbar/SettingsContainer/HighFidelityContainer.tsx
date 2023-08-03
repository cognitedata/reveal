/*!
 * Copyright 2023 Cognite AS
 */
import { Menu } from '@cognite/cogs.js';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { type ResolutionOptions } from '@cognite/reveal';

export const HighFidelityContainer = (): ReactElement => {
  const viewer = useReveal();
  const [isHighQualityMode, setHighQualityMode] = useState(false);

  const defaultsQualityConfig = useMemo(() => {
    return {
      cadBudget: { ...viewer.cadBudget },
      pointCloudBudget: { ...viewer.pointCloudBudget },
      resolutionOptions: {
        maxRenderResolution: 1.4e6,
        movingCameraResolutionFactor: 1
      } satisfies ResolutionOptions
    };
  }, [viewer]);

  const qualityConfig = useMemo(() => {
    if (isHighQualityMode) {
      return {
        pointCloudBudget: {
          numberOfPoints: 3 * defaultsQualityConfig.pointCloudBudget.numberOfPoints
        },
        cadBudget: {
          maximumRenderCost: 3 * defaultsQualityConfig.cadBudget.maximumRenderCost,
          highDetailProximityThreshold: defaultsQualityConfig.cadBudget.highDetailProximityThreshold
        },
        resolutionOptions: {
          maxRenderResolution: Infinity
        }
      };
    } else {
      return {
        pointCloudBudget: { ...defaultsQualityConfig.pointCloudBudget },
        cadBudget: { ...defaultsQualityConfig.cadBudget },
        resolutionOptions: {
          maxRenderResolution: 1.4e6
        }
      };
    }
  }, [isHighQualityMode, viewer]);

  useEffect(() => {
    viewer.cadBudget = qualityConfig.cadBudget;
    viewer.pointCloudBudget = qualityConfig.pointCloudBudget;
    viewer.setResolutionOptions(qualityConfig.resolutionOptions);
  }, [viewer, qualityConfig]);

  return (
    <Menu.Item
      hasSwitch
      toggled={isHighQualityMode}
      onChange={() => {
        setHighQualityMode((prevMode) => !prevMode);
      }}>
      High fidelity
    </Menu.Item>
  );
};
