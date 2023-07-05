/*!
 * Copyright 2023 Cognite AS
 */

import { type CSSProperties, type ReactElement } from 'react';
import { Button, ToolBar } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';

export type RevealToolbarProps = {
  children?: ReactElement;
  className?: string;
  style?: CSSProperties;
};

const defaultStyle: CSSProperties = { position: 'absolute', bottom: '30px', left: '100px' };

export const RevealToolbar = ({ className, style }: RevealToolbarProps): ReactElement => {
  if (className === undefined && style === undefined) {
    style = { ...defaultStyle };
  }
  return (
    <ToolBar className={className} style={style}>
      <>
        <Button type="ghost" icon="Layers" aria-label="3D Resource layers" />

        <div className="cogs-toolbar-divider" />

        <FitModelsButton />
        <Button type="ghost" icon="Collapse" aria-label="Focus asset" />

        <div className="cogs-toolbar-divider" />

        <Button type="ghost" icon="Slice" aria-label="Slice models" />
        <Button type="ghost" icon="Ruler" aria-label="Make measurements" />

        <div className="cogs-toolbar-divider" />

        <Button type="ghost" icon="Settings" aria-label="Show settings" />
        <Button type="ghost" icon="Help" aria-label="Display help" />
      </>
    </ToolBar>
  );
};

RevealToolbar.FitModelsButton = FitModelsButton;
