/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  Image360CollectionContainer,
  PointCloudContainer,
  RevealCanvas,
  RevealContext,
  RevealToolbar
} from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color, Matrix4 } from 'three';

const meta = {
  title: 'Example/Toolbar/LayersContainer',
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

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 1791160622840317,
      revisionId: 498427137020189
    },
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: ({ addModelOptions, transform }) => (
    <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
      <RevealCanvas>
        <CadModelContainer addModelOptions={addModelOptions} />
        <CadModelContainer addModelOptions={addModelOptions} transform={transform} />
        <PointCloudContainer
          addModelOptions={{
            modelId: 3865289545346058,
            revisionId: 4160448151596909
          }}
          transform={new Matrix4()}
        />
        <Image360CollectionContainer collectionId={{ siteId: 'Hibernia_RS2' }} />
        <RevealToolbar />
      </RevealCanvas>
    </RevealContext>
  )
};
