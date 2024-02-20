/*!
 * Copyright 2024 Cognite AS
 */
import { FitModelsButton } from '../RevealToolbar/FitModelsButton';
import { LayersButton } from '../RevealToolbar/LayersButton';
import { type ReactNode, type ReactElement } from 'react';
import { SlicerButton } from '../RevealToolbar/SlicerButton';
import styled from 'styled-components';
import { type CustomToolbarContent } from '../RevealToolbar/RevealToolbar';
import { SettingsButton } from '../RevealToolbar/SettingsButton';
import { HelpButton } from '../RevealToolbar/HelpButton';
import { Divider } from '@cognite/cogs.js';
import {
  SetFlexibleControlsType,
  SetOrbitOrFirstPersonControlsType
} from '../RevealToolbar/SetFlexibleControlsType';
import { SceneSelectionDropdown } from './SceneSelectionDropdown';
import { RuleBasedOutputsButton } from '../RevealToolbar/RuleBasedOutputsButton';

export type CustomTopbarContent = CustomToolbarContent & { topbarContent?: ReactNode };

const DefaultContentWrapper = (props: CustomTopbarContent): ReactElement => {
  return (
    <>
      <LayersButton />
      <SlicerButton />
      <FitModelsButton />
      <RuleBasedOutputsButton />
      <SetOrbitOrFirstPersonControlsType />
      <Divider weight="1px" length="75%" direction="vertical" />
      <HelpButton />
      <SettingsButton
        customSettingsContent={props.customSettingsContent}
        lowQualitySettings={props.lowFidelitySettings}
        highQualitySettings={props.highFidelitySettings}
      />
    </>
  );
};

const RevealTopbarContainer = ({
  customSettingsContent,
  lowFidelitySettings,
  highFidelitySettings,
  storeStateInUrl,
  topbarContent
}: CustomTopbarContent): ReactElement => {
  return (
    <StyledTopBar>
      <TopBarContentContainer>
        {topbarContent ?? (
          <DefaultContentWrapper
            customSettingsContent={customSettingsContent}
            lowFidelitySettings={lowFidelitySettings}
            highFidelitySettings={highFidelitySettings}
            storeStateInUrl={storeStateInUrl}
          />
        )}
      </TopBarContentContainer>
    </StyledTopBar>
  );
};

export const RevealTopbar = RevealTopbarContainer as typeof RevealTopbarContainer & {
  SetFlexibleControlsType: typeof SetFlexibleControlsType;
  SetOrbitOrFistPersonControlsType: typeof SetOrbitOrFirstPersonControlsType;
  SceneSelectionDropdown: typeof SceneSelectionDropdown;
  RuleBasedOutputsButton: typeof RuleBasedOutputsButton;
};

RevealTopbar.SetFlexibleControlsType = SetFlexibleControlsType;
RevealTopbar.SetOrbitOrFistPersonControlsType = SetOrbitOrFirstPersonControlsType;
RevealTopbar.SceneSelectionDropdown = SceneSelectionDropdown;
RevealTopbar.RuleBasedOutputsButton = RuleBasedOutputsButton;

const StyledTopBar = styled.div`
  width: 100%;
  height: 56px;
  display: flex;
`;

const TopBarContentContainer = styled.div`
  width: 100%;
  height: 75%;
  margin: auto;
  flex-direction: row;
  display: flex;
`;
