/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement, useMemo } from 'react';
import { Button, Dropdown } from '@cognite/cogs.js';
import { SettingsContainer } from './SettingsContainer/SettingsContainer';
import { type ResolutionOptions } from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { type DeepPartial } from '../../utilities/DeepPartial';
import { type QualityConfig } from './SettingsContainer/types';

type CustomSettingsProps = {
  customSettingsContent?: ReactElement;
  customHighFidelityConfig?: DeepPartial<QualityConfig>;
};

export const SettingsButton = ({
  customSettingsContent,
  customHighFidelityConfig
}: CustomSettingsProps): ReactElement => {
  const viewer = useReveal();
  const [isHighQualityMode, setHighQualityMode] = useState(false);

  const defaultsFidelityConfig = useMemo(() => {
    return {
      pointCloudBudget: { ...viewer.pointCloudBudget },
      cadBudget: { ...viewer.cadBudget },
      resolutionOptions: {
        maxRenderResolution: 1.4e6,
        movingCameraResolutionFactor: 1
      } satisfies ResolutionOptions
    };
  }, [viewer]);

  return (
    <Dropdown
      appendTo={document.body}
      content={
        <SettingsContainer
          customSettingsContent={customSettingsContent}
          isHighFidelityMode={isHighQualityMode}
          setHighFidelityMode={setHighQualityMode}
          defaultsFidelityConfig={defaultsFidelityConfig}
          customHighFidelityConfig={
            customHighFidelityConfig ?? {
              pointCloudBudget: {},
              cadBudget: {},
              resolutionOptions: {}
            }
          }
        />
      }
      placement="auto">
      <Button icon="Settings" type="ghost" aria-label="Show settings" />
    </Dropdown>
  );
};
