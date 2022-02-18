import React from 'react';
import styled from 'styled-components/macro';
import { Story } from '@storybook/react';
import { Graph } from './Graph';

const nodes = [
  {
    id: '0',
    title: 'Movie',
  },
  {
    id: '1',
    title: 'Actor',
  },
];

const links = [
  {
    source: nodes[0].id,
    target: nodes[1].id,
  },
];

export default {
  title: 'Basic Components/Graph',
  component: Graph,
  decorators: [
    (storyFn: () => React.ReactNode) => (
      <div style={{ height: 500, width: '100%' }}>{storyFn()}</div>
    ),
  ],
};

const Template: Story<Parameters<typeof Graph>[0]> = (args) => (
  <Graph {...args} />
);

export const Default = Template.bind({});

Default.args = {
  nodes,
  links,
  renderNode: (item) => (
    <NodeWrapper id={item.id} key={item.id} title={item.title}>
      {item.title}
    </NodeWrapper>
  ),
};

const NodeWrapper = styled.div`
  padding: 25px 20px;
  width: 80px;
  background-color: var(--cogs-white);
  border: 1px solid var(--cogs-greyscale-grey5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
`;
