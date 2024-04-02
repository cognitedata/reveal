/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type JSX, forwardRef, type Ref } from 'react';
import { Divider, ToolBar, type ToolBarProps } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';
import { LayersButton } from './LayersButton';
import { SlicerButton } from './SlicerButton';
import { SettingsButton } from './SettingsButton';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { MeasurementButton } from './MeasurementButton';
import { HelpButton } from './HelpButton';
import { ShareButton } from './ShareButton';
import { ResetCameraButton } from './ResetCameraButton';
import { type QualitySettings } from './SettingsContainer/types';
import styled from 'styled-components';
import { SelectSceneButton } from './SelectSceneButton';
import { RuleBasedOutputsButton } from './RuleBasedOutputsButton';
import {
  SetFlexibleControlsType,
  SetOrbitOrFirstPersonControlsType
} from './SetFlexibleControlsType';

const StyledToolBar = styled(ToolBar)`
  position: absolute;
  left: 20px;
  top: 70px;
  width: 48px;
  padding: 6px;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid rgba(83, 88, 127, 0.24);
`;

export type RevealToolbarProps = ToolBarProps & CustomToolbarContent;

export type CustomToolbarContent = {
  customSettingsContent?: JSX.Element;
  lowFidelitySettings?: Partial<QualitySettings>;
  highFidelitySettings?: Partial<QualitySettings>;
  storeStateInUrl?: boolean;
};

const DefaultContentWrapper = (props: CustomToolbarContent): ReactElement => {
  return (
    <>
      <LayersButton />
      <FitModelsButton />
      <RuleBasedOutputsButton />
      <Divider weight="2px" length="75%" />

      <SlicerButton storeStateInUrl={props.storeStateInUrl} />
      <MeasurementButton />

      <Divider weight="2px" length="75%" />

      <ShareButton />

      <Divider weight="2px" length="75%" />

      <SettingsButton
        customSettingsContent={props.customSettingsContent}
        lowQualitySettings={props.lowFidelitySettings}
        highQualitySettings={props.highFidelitySettings}
      />
      <HelpButton />
    </>
  );
};

const RevealToolbarContainer = forwardRef(
  (
    {
      customSettingsContent,
      lowFidelitySettings,
      highFidelitySettings,
      toolBarContent,
      storeStateInUrl,
      ...restProps
    }: RevealToolbarProps & { toolBarContent?: JSX.Element },
    ref: Ref<HTMLDivElement>
  ): ReactElement => {
    return (
      <StyledToolBar {...restProps} ref={ref}>
        {toolBarContent ?? (
          <DefaultContentWrapper
            customSettingsContent={customSettingsContent}
            highFidelitySettings={highFidelitySettings}
            lowFidelitySettings={lowFidelitySettings}
            storeStateInUrl={storeStateInUrl}
          />
        )}
      </StyledToolBar>
    );
  }
);

RevealToolbarContainer.displayName = 'RevealToolbarContainer';

export const RevealToolbar = withSuppressRevealEvents(
  RevealToolbarContainer
) as typeof RevealToolbarContainer & {
  FitModelsButton: typeof FitModelsButton;
  SlicerButton: typeof SlicerButton;
  LayersButton: typeof LayersButton;
  MeasurementButton: typeof MeasurementButton;
  ShareButton: typeof ShareButton;
  SettingsButton: typeof SettingsButton;
  HelpButton: typeof HelpButton;
  ResetCameraButton: typeof ResetCameraButton;
  SelectSceneButton: typeof SelectSceneButton;
  RuleBasedOutputsButton: typeof RuleBasedOutputsButton;
  SetOrbitOrFirstPersonControlsType: typeof SetOrbitOrFirstPersonControlsType;
  SetFlexibleControlsType: typeof SetFlexibleControlsType;
};

RevealToolbar.FitModelsButton = FitModelsButton;
RevealToolbar.SlicerButton = SlicerButton;
RevealToolbar.LayersButton = LayersButton;
RevealToolbar.MeasurementButton = MeasurementButton;
RevealToolbar.ShareButton = ShareButton;
RevealToolbar.SettingsButton = SettingsButton;
RevealToolbar.HelpButton = HelpButton;
RevealToolbar.ResetCameraButton = ResetCameraButton;
RevealToolbar.SelectSceneButton = SelectSceneButton;
RevealToolbar.RuleBasedOutputsButton = RuleBasedOutputsButton;
RevealToolbar.SetOrbitOrFirstPersonControlsType = SetOrbitOrFirstPersonControlsType;
RevealToolbar.SetFlexibleControlsType = SetFlexibleControlsType;
