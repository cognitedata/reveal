/*!
 * Copyright 2023 Cognite AS
 */

import { type CSSProperties, type ReactElement } from 'react';
import { Divider, ToolBar } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';

import { ToolbarButton } from './ToolbarButton';

export type RevealToolbarProps = {
  children?: ReactElement;
  className?: string;
  style?: CSSProperties;
};

const defaultButtons = (
  <>
    <ToolbarButton icon="Layers" aria-label="3D Resource layers" />

    <Divider />

    <FitModelsButton />
    <ToolbarButton icon="Collapse" aria-label="Focus asset" />

    <Divider />

    <ToolbarButton icon="Slice" aria-label="Slice models" />
    <ToolbarButton icon="Ruler" aria-label="Make measurements" />

    <Divider />

    <ToolbarButton icon="Settings" aria-label="Show settings" />
    <ToolbarButton icon="Help" aria-label="Display help" />
  </>
);

const defaultStyle: CSSProperties = { position: 'absolute', bottom: '30px', left: '100px' };

export const RevealToolbar = ({ children, className, style }: RevealToolbarProps): ReactElement => {
  if (className === undefined && style === undefined) {
    style = { ...defaultStyle };
  }
  return (
    <ToolBar className={className} style={style}>
      {children ?? defaultButtons}
    </ToolBar>
  );
};
