/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealCanvas, RevealContext, RevealToolbar } from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color, Matrix4, Vector3 } from 'three';

const meta = {
  title: 'Example/Toolbar/LayersContainer',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token') ?? '';
const sdk = new CogniteClient({
  appId: 'reveal.example',
  baseUrl: 'https://greenfield.cognitedata.com',
  project: '3d-test',
  getToken: async () => await Promise.resolve(token)
});

const cadResource = {
  modelId: 1791160622840317,
  revisionId: 498427137020189
};

const pointCloudResource = {
  modelId: 3865289545346058,
  revisionId: 4160448151596909
};

const image360Resource = { siteId: 'Hibernia_RS2' };

export const Main: Story = {
  args: {
    resources: [
      cadResource,
      { ...cadResource, transform: new Matrix4().makeTranslation(new Vector3(0, 10, 0)) },
      pointCloudResource,
      image360Resource
    ]
  },
  render: ({ resources }) => (
    <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
      <RevealCanvas>
        <Reveal3DResources resources={resources} />
        <RevealToolbar />
      </RevealCanvas>
    </RevealContext>
  )
};
