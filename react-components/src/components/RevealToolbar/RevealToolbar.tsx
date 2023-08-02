/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type JSX } from 'react';
import { Button, ToolBar, type ToolBarProps } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';
import { LayersButton } from './LayersButton';
import { SlicerButton } from './SlicerButton';
import { HighQualityButton } from './HighQualityButton';

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
    <Button type="ghost" icon="Ruler" aria-label="Make measurements" />

    <div className="cogs-toolbar-divider" />

    <HighQualityButton />
    <Button type="ghost" icon="Help" aria-label="Display help" />
  </>
);

export const RevealToolbar = (
  props: ToolBarProps & { toolBarContent?: JSX.Element }
): ReactElement => {
  if (props.className === undefined && props.style === undefined) {
    props = { ...props, ...defaultStyle };
  }
  return <ToolBar {...props}>{props.toolBarContent ?? defaultContent}</ToolBar>;
};

RevealToolbar.FitModelsButton = FitModelsButton;
RevealToolbar.SlicerButton = SlicerButton;
RevealToolbar.LayersButton = LayersButton;
