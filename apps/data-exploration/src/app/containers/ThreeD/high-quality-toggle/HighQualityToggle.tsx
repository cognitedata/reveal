import { useMemo, useState } from 'react';

import styled from 'styled-components';

import { Button, Tooltip } from '@cognite/cogs.js';
import { Cognite3DViewer, ResolutionOptions } from '@cognite/reveal';

import { useTranslation } from '@data-exploration-lib/core';

import { EXPLORATION } from '../../../constants/metrics';
import { trackUsage } from '../../../utils/Metrics';

type HighQualityToggleProps = {
  viewer: Cognite3DViewer;
};

export default function HighQualityToggle({ viewer }: HighQualityToggleProps) {
  const { t } = useTranslation();
  const [isHighQualityMode, setHighQualityMode] = useState(false);
  const defaults = useMemo(() => {
    return {
      cadBudget: { ...viewer.cadBudget },
      pointCloudBudget: { ...viewer.pointCloudBudget },
      resolutionOptions: {
        maxRenderResolution: 1.4e6,
        movingCameraResolutionFactor: 1,
      } as ResolutionOptions,
    };
  }, [viewer]);

  function handleHighFidelityToggled() {
    const toggledOn = !isHighQualityMode;
    setHighQualityMode(!isHighQualityMode);
    trackUsage(EXPLORATION.THREED_SELECT.TOGGLE_HIGH_FIDELITY_RENDERING, {
      highFidelityEnabled: toggledOn,
      resourceType: '3D',
    });

    if (toggledOn) {
      viewer.pointCloudBudget = {
        numberOfPoints: 3 * defaults.pointCloudBudget.numberOfPoints,
      };
      viewer.cadBudget = {
        maximumRenderCost: 3 * defaults.cadBudget.maximumRenderCost,
        highDetailProximityThreshold:
          defaults.cadBudget.highDetailProximityThreshold,
      };
      viewer.setResolutionOptions({ maxRenderResolution: Infinity });
    } else {
      viewer.pointCloudBudget = { ...defaults.pointCloudBudget };
      viewer.cadBudget = { ...defaults.cadBudget };
      viewer.setResolutionOptions({ ...defaults.resolutionOptions });
    }
  }

  return (
    <Tooltip
      content={t(
        'TOGGLE_IMPROVED_FIDELITY_RENDERING',
        'Toggle improved fidelity rendering. Note that this might affect performance.'
      )}
      placement="right"
    >
      <FullWidthButton
        onClick={handleHighFidelityToggled}
        toggled={isHighQualityMode}
        icon={isHighQualityMode ? 'SunHigh' : 'SunLow'}
        type="ghost"
        aria-label="asset-labels-button"
      />
    </Tooltip>
  );
}

const FullWidthButton = styled(Button)`
  width: 100%;
`;
