/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealContainer } from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color, Matrix4 } from 'three';

const meta = {
  title: 'Example/Reveal3DResources',
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

export const Main: Story = {
  args: {
    resources: [
      {
        type: 'cad',
        modelId: 1791160622840317,
        revisionId: 498427137020189
      },
      {
        type: 'cad',
        modelId: 1791160622840317,
        revisionId: 502149125550840,
        transform: new Matrix4().makeTranslation(0, 10, 0)
      },
      {
        siteId: 'c_RC_2'
      },
      {
        type: 'pointcloud',
        modelId: 3865289545346058,
        revisionId: 4160448151596909
      }
    ]
  },
  render: ({ resources }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <Reveal3DResources resources={resources} />
    </RevealContainer>
  )
};
