/*!
 * Copyright 2024 Cognite AS
 */
import { FitModelsButton } from '../RevealToolbar/FitModelsButton';
import { type ReactNode, type ReactElement } from 'react';
import { SlicerButton } from '../RevealToolbar/SlicerButton';
import styled from 'styled-components';
import { type CustomToolbarContent } from '../RevealToolbar/RevealToolbar';
import { SettingsButton } from '../RevealToolbar/SettingsButton';
import { HelpButton } from '../RevealToolbar/HelpButton';
import { Divider } from '@cognite/cogs.js';
import { RuleBasedOutputsButton } from '../RevealToolbar/RuleBasedOutputsButton';
import { LayersButtonStrip } from '../RevealToolbar/LayersButton/LayersButtonsStrip';
import { ResetCameraButton } from '../RevealToolbar/ResetCameraButton';
import { RevealButtons } from '../Architecture';

export type CustomTopbarContent = CustomToolbarContent & { topbarContent?: ReactNode };

const DefaultContentWrapper = (props: CustomTopbarContent): ReactElement => {
  return (
    <>
      <FlexSection>
        <SlicerButton />
        <FitModelsButton />
      </FlexSection>
      <FlexSection>
        <LayersButtonStrip />
        <RuleBasedOutputsButton />
      </FlexSection>
      <FlexSection>
        <RevealButtons.SetOrbitOrFirstPersonMode toolbarPlacement="top" />
        <Divider weight="1px" length="75%" direction="vertical" />
        <HelpButton />
        <SettingsButton
          customSettingsContent={props.customSettingsContent}
          lowQualitySettings={props.lowFidelitySettings}
          highQualitySettings={props.highFidelitySettings}
        />
        <ResetCameraButton />
      </FlexSection>
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

const FlexSection = styled.div`
  flex: 1;
  flex-direction: row;
  display: flex;
`;

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
