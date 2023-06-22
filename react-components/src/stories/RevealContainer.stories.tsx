import type { Meta, StoryObj } from '@storybook/react';

import { CogniteCadModelContainer, RevealContainer } from '..';
import { CogniteClient } from '@cognite/sdk';
import { Color, Matrix4 } from 'three';


const meta = {
  title: 'Example/RevealContainer',
  component: RevealContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof RevealContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token')!;

export const Main: Story = {
  args: {
    sdk: new CogniteClient({ appId: 'reveal.example', baseUrl: 'https://greenfield.cognitedata.com', project: '3d-test', getToken: () => Promise.resolve(token) }),
    color: new Color(0x4a4a4a)
  },
  render: (args) =>
    <RevealContainer {...args} >
      <CogniteCadModelContainer modelId={1791160622840317} revisionId={498427137020189} transform={new Matrix4().makeTranslation(0, 10, 0)} />
      <CogniteCadModelContainer modelId={1791160622840317} revisionId={498427137020189} />
    </RevealContainer>
};
