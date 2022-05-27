import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { AssetTreeTable } from './AssetTreeTable';

export default {
  title: 'Assets/AssetTreeTable',
  component: AssetTreeTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'string' } },
};

export const Example = args => <AssetTreeTable {...args} />;
Example.args = {
  onAssetSelected: action('onAssetSelected'),
  isSelected: () => {},
};

export const ExampleSingleSelect = args => <AssetTreeTable {...args} />;
ExampleSingleSelect.args = {
  selectionMode: 'single',
  onAssetSelected: action('onAssetSelected'),
  isSelected: () => {},
};

const Container = styled.div`
  padding: 20px;
  width: 100%;
  height: 600px;
  background: grey;
  display: flex;
  position: relative;

  && > * {
    background: #fff;
  }
`;
