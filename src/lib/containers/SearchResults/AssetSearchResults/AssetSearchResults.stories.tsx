import React from 'react';
import styled from 'styled-components';
import { text } from '@storybook/addon-knobs';
import { AssetSearchResults } from './AssetSearchResults';

export default {
  title: 'Search Results/AssetSearchResults',
  component: AssetSearchResults,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => <AssetSearchResults query={text('query', '')} />;

const Container = styled.div`
  height: 400px;
`;
