/*!
 * Copyright 2023 Cognite AS
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Divider, ToolBar } from '@cognite/cogs.js';
import { SliceButton } from './SliceButton';
import { FitModelsButton } from './FitModelsButton';

import { ToolbarButton } from './ToolbarButton';

export type ToolbarProps = {
  children?: JSX.Element;
};

const defaultButtons = (
  <>
    <ToolbarButton icon="Layers" aria-label="Show layer options" />

    <Divider />

    <FitModelsButton />
    <ToolbarButton icon="Collapse" aria-label="Focus asset" />

    <Divider />

    <SliceButton />
    <ToolbarButton icon="Ruler" aria-label="Make measurements" />

    <Divider />

    <ToolbarButton icon="Settings" aria-label="Show settings" />
    <ToolbarButton icon="Help" aria-label="Display help" />
  </>
);

const Toolbar = (props: ToolbarProps) => {
  const hasCustomChildren = props.children !== undefined;

  return <FloatingToolbar>{hasCustomChildren ? props.children : defaultButtons}</FloatingToolbar>;
};

const FloatingToolbar = styled(ToolBar)`
  position: absolute;
  left: 30px;
  bottom: 30px;
`;

export default Toolbar;
