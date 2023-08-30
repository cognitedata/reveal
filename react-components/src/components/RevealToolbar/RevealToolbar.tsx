/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type JSX } from 'react';
import { ToolBar, type ToolBarProps } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';
import { LayersButton } from './LayersButton';
import { SlicerButton } from './SlicerButton';
import { SettingsButton } from './SettingsButton';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { MeasurementButton } from './MeasurementButton';
import { HelpButton } from './HelpButton';
import { type QualitySettings } from './SettingsContainer/types';

const defaultStyle: ToolBarProps = {
  style: {
    position: 'absolute',
    left: '20px',
    top: '70px'
  }
};

type RevealToolbarProps = ToolBarProps & {
  customSettingsContent?: JSX.Element;
  lowFidelitySettings?: Partial<QualitySettings>;
  highFidelitySettings?: Partial<QualitySettings>;
};

const DefaultContentWrapper = (props: RevealToolbarProps): ReactElement => {
  return (
    <>
      <LayersButton />
      <FitModelsButton />

      <div className="cogs-toolbar-divider" />

      <SlicerButton />
      <MeasurementButton />

      <div className="cogs-toolbar-divider" />

      <SettingsButton
        customSettingsContent={props.customSettingsContent}
        lowQualitySettings={props.lowFidelitySettings}
        highQualitySettings={props.highFidelitySettings}
      />
      <HelpButton />
    </>
  );
};

const RevealToolbarContainer = (
  props: RevealToolbarProps & { toolBarContent?: JSX.Element }
): ReactElement => {
  if (props.className === undefined && props.style === undefined) {
    props = { ...props, ...defaultStyle };
  }
  return (
    <ToolBar {...props}>{props.toolBarContent ?? <DefaultContentWrapper {...props} />}</ToolBar>
  );
};

export const RevealToolbar = withSuppressRevealEvents(
  RevealToolbarContainer
) as typeof RevealToolbarContainer & {
  FitModelsButton: typeof FitModelsButton;
  SlicerButton: typeof SlicerButton;
  LayersButton: typeof LayersButton;
  MeasurementButton: typeof MeasurementButton;
  SettingsButton: typeof SettingsButton;
  HelpButton: typeof HelpButton;
};

RevealToolbar.FitModelsButton = FitModelsButton;
RevealToolbar.SlicerButton = SlicerButton;
RevealToolbar.LayersButton = LayersButton;
RevealToolbar.MeasurementButton = MeasurementButton;
RevealToolbar.SettingsButton = SettingsButton;
RevealToolbar.HelpButton = HelpButton;
