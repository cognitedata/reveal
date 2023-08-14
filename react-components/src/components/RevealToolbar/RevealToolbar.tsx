/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type JSX } from 'react';
import { Button, ToolBar, type ToolBarProps } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';
import { LayersButton } from './LayersButton';
import { SlicerButton } from './SlicerButton';
import { SettingsButton } from './SettingsButton';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { MeasurementButton } from './MeasurementButton';
import { HelpButton } from './HelpButton';

const defaultStyle: ToolBarProps = {
  style: {
    position: 'absolute',
    left: '20px',
    top: '70px'
  }
};

const defaultContent = (
  <>
    <LayersButton />

    <FitModelsButton />
    <Button type="ghost" icon="Collapse" aria-label="Focus asset" />

    <div className="cogs-toolbar-divider" />

    <SlicerButton />
    <MeasurementButton />

    <div className="cogs-toolbar-divider" />

    <SettingsButton />
    <HelpButton />
  </>
);

const RevealToolbarContainer = (
  props: ToolBarProps & { toolBarContent?: JSX.Element }
): ReactElement => {
  if (props.className === undefined && props.style === undefined) {
    props = { ...props, ...defaultStyle };
  }
  return <ToolBar {...props}>{props.toolBarContent ?? defaultContent}</ToolBar>;
};

export const RevealToolbar = withSuppressRevealEvents(
  RevealToolbarContainer
) as typeof RevealToolbarContainer & {
  FitModelsButton: typeof FitModelsButton;
  SlicerButton: typeof SlicerButton;
  LayersButton: typeof LayersButton;
  MeasurementButton: typeof MeasurementButton;
  HelpButton: typeof HelpButton;
};

RevealToolbar.FitModelsButton = FitModelsButton;
RevealToolbar.SlicerButton = SlicerButton;
RevealToolbar.LayersButton = LayersButton;
RevealToolbar.MeasurementButton = MeasurementButton;
RevealToolbar.HelpButton = HelpButton;
