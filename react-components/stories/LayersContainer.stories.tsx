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
import { type AddModelOptions } from '@cognite/reveal';

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
      modelId: 3807217268457110,
      revisionId: 3228479948927774
    },
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: ({
    addModelOptions,
    transform
  }: {
    addModelOptions: AddModelOptions;
    transform?: Matrix4;
  }) => (
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
        <Image360CollectionContainer
          addImage360CollectionOptions={{ source: 'events', siteId: 'Hibernia_RS2' }}
        />
        <RevealToolbar />
      </RevealCanvas>
    </RevealContext>
  )
};
