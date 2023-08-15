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
  defaultsFidelityConfig,
  customHighFidelityConfig
}: HighFidelityProps): ReactElement => {
  const viewer = useReveal();

  const qualityConfig = useMemo(() => {
    if (isHighFidelityMode) {
      return {
        pointCloudBudget: {
          numberOfPoints:
            customHighFidelityConfig?.pointCloudBudget?.numberOfPoints ??
            defaultsFidelityConfig.pointCloudBudget.numberOfPoints * FIDELITY_MULTIPLIER
        },
        cadBudget: {
          maximumRenderCost:
            customHighFidelityConfig?.cadBudget?.maximumRenderCost ??
            defaultsFidelityConfig.cadBudget.maximumRenderCost * FIDELITY_MULTIPLIER,
          highDetailProximityThreshold:
            customHighFidelityConfig?.cadBudget?.highDetailProximityThreshold ??
            defaultsFidelityConfig.cadBudget.highDetailProximityThreshold * FIDELITY_MULTIPLIER
        },
        resolutionOptions: {
          maxRenderResolution:
            customHighFidelityConfig?.resolutionOptions?.maxRenderResolution ?? Infinity
        }
      };
    } else {
      return { ...defaultsFidelityConfig };
    }
  }, [isHighFidelityMode, defaultsFidelityConfig, customHighFidelityConfig]);

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
