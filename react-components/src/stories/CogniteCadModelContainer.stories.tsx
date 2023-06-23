import type { Meta, StoryObj } from '@storybook/react';
import { CogniteCadModelContainer, RevealContainer } from '..';
import { CogniteClient } from '@cognite/sdk';
import { Color, Matrix4 } from 'three';

const meta = {
  title: 'Example/CogniteCadModelContainer',
  component: CogniteCadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CogniteCadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token')!;
const sdk = new CogniteClient({ appId: 'reveal.example', baseUrl: 'https://greenfield.cognitedata.com', project: '3d-test', getToken: () => Promise.resolve(token) });

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 1791160622840317,
      revisionId: 498427137020189
    },
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: ({ addModelOptions, transform }) =>
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)} >
      <CogniteCadModelContainer addModelOptions={addModelOptions} />
      <CogniteCadModelContainer addModelOptions={addModelOptions} transform={transform} />
    </RevealContainer>
};
