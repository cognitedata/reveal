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
import { SetOrbitOrFirstPersonControlsType } from '../RevealToolbar/SetFlexibleControlsType';
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

export const RevealTopbar = ({
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
