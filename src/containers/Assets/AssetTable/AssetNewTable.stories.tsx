import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { assets } from 'stubs/assets';
import { ComponentStory } from '@storybook/react';
import { AssetNewTable } from './AssetNewTable';

export default {
  title: 'Assets/AssetNewTable',
  component: AssetNewTable,
  decorators: [
    (storyFn: any) => (
      <AssetNewTableContainer>{storyFn()}</AssetNewTableContainer>
    ),
  ],
  argTypes: {
    query: {
      type: 'string',
      defaultValue: '',
    },
  },
};

export const Example: ComponentStory<typeof AssetNewTable> = args => (
  <AssetNewTable {...args} />
);
Example.args = {
  data: assets,
  onRowClick: action('onRowClicked'),
};

const AssetNewTableContainer = styled.div`
  height: 100%;
`;
