/*!
 * Copyright 2023 Cognite AS
 */
import { Menu } from '@cognite/cogs.js';
import { type ReactElement, useEffect, useMemo } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { type ResolutionOptions } from '@cognite/reveal';
import { type HighFidelityProps } from './types';

export const HighFidelityContainer = ({
  isHighFidelityMode,
  setHighFidelityMode
}: HighFidelityProps): ReactElement => {
  const viewer = useReveal();

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
    if (isHighFidelityMode) {
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
  }, [isHighFidelityMode, viewer]);

  useEffect(() => {
    viewer.cadBudget = qualityConfig.cadBudget;
    viewer.pointCloudBudget = qualityConfig.pointCloudBudget;
    viewer.setResolutionOptions(qualityConfig.resolutionOptions);
  }, [viewer, qualityConfig]);

  return (
    <Menu.Item
      hasSwitch
      toggled={isHighFidelityMode}
      onChange={() => {
        setHighFidelityMode((prevState) => !prevState);
      }}>
      High fidelity
    </Menu.Item>
  );
};
