import React from 'react';
import { Overline } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ComponentStory } from '@storybook/react';
import { ResourceIcons } from './ResourceIcons';

export default {
  title: 'Component/ResourceIcons',
  component: ResourceIcons,
  argTypes: {
    type: {
      type: 'select',
      options: ['asset', 'timeSeries', 'sequence', 'file', 'event', 'threeD'],
    },
  },
};
export const Simple: ComponentStory<typeof ResourceIcons> = args => (
  <Item>
    <ResourceIcons {...args} />
  </Item>
);
Simple.args = {
  type: 'asset',
};
export const Typed = () => (
  <div>
    <Item>
      <Overline>Asset</Overline>
      <ResourceIcons.Asset />
    </Item>
    <Item>
      <Overline>Event</Overline>
      <ResourceIcons.Event />
    </Item>
    <Item>
      <Overline>File</Overline>
      <ResourceIcons.File />
    </Item>
    <Item>
      <Overline>Sequence</Overline>
      <ResourceIcons.Sequence />
    </Item>
    <Item>
      <Overline>Timeseries</Overline>
      <ResourceIcons.Timeseries />
    </Item>
  </div>
);

const Item = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-right: 12px;

  && > * {
    margin-bottom: 12px;
  }
`;
