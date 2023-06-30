/*!
 * Copyright 2023 Cognite AS
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Divider, ToolBar } from '@cognite/cogs.js';
import { FitModelsButton } from './FitModelsButton';

import { ToolbarButton } from './ToolbarButton';

export type ToolbarProps = {
  children?: JSX.Element;
};

const defaultButtons = (
  <>
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

const Toolbar = (props: ToolbarProps) => {
  return <FloatingToolbar>{props.children ?? defaultButtons}</FloatingToolbar>;
};

const FloatingToolbar = styled(ToolBar)`
  position: absolute;
  left: 30px;
  bottom: 30px;
`;

export default Toolbar;
