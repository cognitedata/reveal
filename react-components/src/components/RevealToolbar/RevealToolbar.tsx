/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Button, ToolBar, type ToolBarProps } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';
import { SlicerButton } from './SlicerButton';

const defaultStyle: ToolBarProps = {
  style: {
    position: 'absolute',
    left: '20px',
    top: '70px'
  }
};

export const RevealToolbar = (toolBarProps: ToolBarProps): ReactElement => {
  if (toolBarProps.className === undefined && toolBarProps.style === undefined) {
    toolBarProps = { ...toolBarProps, ...defaultStyle };
  }
  return (
    <ToolBar {...toolBarProps}>
      <>
        <Button type="ghost" icon="Layers" aria-label="3D Resource layers" />

        <div className="cogs-toolbar-divider" />

        <FitModelsButton />
        <Button type="ghost" icon="Collapse" aria-label="Focus asset" />

        <div className="cogs-toolbar-divider" />

        <SlicerButton />
        <Button type="ghost" icon="Ruler" aria-label="Make measurements" />

        <div className="cogs-toolbar-divider" />

        <Button type="ghost" icon="Settings" aria-label="Show settings" />
        <Button type="ghost" icon="Help" aria-label="Display help" />
      </>
    </ToolBar>
  );
};

RevealToolbar.FitModelsButton = FitModelsButton;
