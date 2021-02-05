import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { AssetTreeTable } from './AssetTreeTable';

export default {
  title: 'Assets/AssetTreeTable',
  component: AssetTreeTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => (
  <AssetTreeTable
    filter={{}}
    onAssetClicked={action('onAssetClicked')}
    query={text('query', '')}
    isSelected={() => {}}
  />
);
export const ExampleSingleSelect = () => (
  <AssetTreeTable
    selectionMode="single"
    filter={{}}
    onAssetClicked={action('onAssetClicked')}
    query={text('query', '')}
    isSelected={() => {}}
  />
);

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
