/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useEffect, useMemo } from 'react';
import { Menu } from '@cognite/cogs.js';
import { useReveal } from '../../RevealContainer/RevealContext';
import { type HighFidelityProps } from './types';
import { FIDELITY_MULTIPLIER } from '../../../utilities/constants';

export const HighFidelityContainer = ({
  isHighFidelityMode,
  setHighFidelityMode,
  defaultsQualityConfig,
  highFidelityConfig
}: HighFidelityProps): ReactElement => {
  const viewer = useReveal();

  const qualityConfig = useMemo(() => {
    if (isHighFidelityMode) {
      return {
        pointCloudBudget: {
          numberOfPoints:
            highFidelityConfig?.pointCloudBudget?.numberOfPoints ??
            defaultsQualityConfig.pointCloudBudget.numberOfPoints * FIDELITY_MULTIPLIER
        },
        cadBudget: {
          maximumRenderCost:
            highFidelityConfig?.cadBudget?.maximumRenderCost ??
            defaultsQualityConfig.cadBudget.maximumRenderCost * FIDELITY_MULTIPLIER,
          highDetailProximityThreshold:
            highFidelityConfig?.cadBudget?.highDetailProximityThreshold ??
            defaultsQualityConfig.cadBudget.highDetailProximityThreshold * FIDELITY_MULTIPLIER
        },
        resolutionOptions: {
          maxRenderResolution:
            highFidelityConfig?.resolutionOptions?.maxRenderResolution ?? Infinity
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
  }, [isHighFidelityMode, defaultsQualityConfig, highFidelityConfig]);

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
