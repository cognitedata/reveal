import React from 'react';

import styled from 'styled-components';

import { ComponentStory } from '@storybook/react';

import { AssetSearchResults } from './AssetSearchResults';

export default {
  title: 'Search Results/AssetSearchResults',
  component: AssetSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof AssetSearchResults> = (args) => (
  <Container>
    <AssetSearchResults {...args} />
  </Container>
);
Example.args = {
  showCount: true,
  isTreeEnabled: true,
  filter: {},
};

const Container = styled.div`
  height: 400px;
`;
