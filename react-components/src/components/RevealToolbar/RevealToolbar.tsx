/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type JSX } from 'react';
import { Button, ToolBar, type ToolBarProps } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';
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
    <Button type="ghost" icon="Layers" aria-label="3D Resource layers" />

    <div className="cogs-toolbar-divider" />

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
