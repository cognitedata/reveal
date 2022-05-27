import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { assets } from '../../../stubs/assets';
import { AssetTable } from './AssetTable';

export default {
  title: 'Assets/AssetTable',
  component: AssetTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: {
    query: {
      type: 'string',
      defaultValue: '',
    },
  },
};

export const Example = args => <AssetTable {...args} />;
Example.args = {
  items: assets,
  onItemClicked: action('onItemClicked'),
};

export const ExampleSingleSelect = args => <AssetTable {...args} />;
ExampleSingleSelect.args = {
  selectionMode: 'single',
  items: assets,
  onItemClicked: action('onItemClicked'),
};

const Container = styled.div`
  height: 600px;
`;
