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
  highFidelityConfig?: DeepPartial<QualityConfig>;
};

export const SettingsButton = ({
  customSettingsContent,
  highFidelityConfig
}: CustomSettingsProps): ReactElement => {
  const viewer = useReveal();
  const [, setSettingsEnabled] = useState(false);
  const [isHighQualityMode, setHighQualityMode] = useState(false);
  const SettingsButton = (): void => {
    setSettingsEnabled((prevState) => !prevState);
  };

  const defaultsQualityConfig = useMemo(() => {
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
          defaultsQualityConfig={defaultsQualityConfig}
          highFidelityConfig={
            highFidelityConfig ?? { pointCloudBudget: {}, cadBudget: {}, resolutionOptions: {} }
          }
        />
      }
      placement="auto">
      <Button onClick={SettingsButton} icon="Settings" type="ghost" aria-label="Show settings" />
    </Dropdown>
  );
};
