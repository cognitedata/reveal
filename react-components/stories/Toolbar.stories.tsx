/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer, RevealContainer, RevealToolbar } from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color } from 'three';
import styled from 'styled-components';
import { ToolBar, type ToolBarButton } from '@cognite/cogs.js';

const meta = {
  title: 'Example/Toolbar',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token') ?? '';
const sdk = new CogniteClient({
  appId: 'reveal.example',
  baseUrl: 'https://greenfield.cognitedata.com',
  project: '3d-test',
  getToken: async () => await Promise.resolve(token)
});

const StyledRevealToolBar = styled(RevealToolbar)`
  position: absolute;
  left: 20px;
  top: 70px;
`;

const RightStyledToolbar = styled(ToolBar)`
  position: absolute;
  left: 80px;
  top: 70px;
`;

const exampleToolBarButtons: ToolBarButton[] = [
  {
    icon: 'Edit'
  },
  {
    icon: 'World'
  }
];

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 1791160622840317,
      revisionId: 498427137020189
    }
  },
  render: ({ addModelOptions }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <CadModelContainer addModelOptions={addModelOptions} />
      <StyledRevealToolBar />
      <RightStyledToolbar>
        <RevealToolbar.FitModelsButton />
        <ToolBar.ButtonGroup buttonGroup={exampleToolBarButtons} />
      </RightStyledToolbar>
    </RevealContainer>
  )
};
