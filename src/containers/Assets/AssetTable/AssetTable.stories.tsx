import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { assets } from 'stubs/assets';
import { AssetTable } from './AssetTable';

export default {
  title: 'Assets/AssetTable',
  component: AssetTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => (
  <AssetTable
    items={assets}
    onItemClicked={action('onItemClicked')}
    query={text('query', '')}
  />
);
export const ExampleSingleSelect = () => (
  <AssetTable
    selectionMode="single"
    items={assets}
    onItemClicked={action('onItemClicked')}
    query={text('query', '')}
  />
);

const Container = styled.div`
  height: 600px;
`;
