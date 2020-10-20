import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { SearchResultTable } from './SearchResultTable';

export default {
  title: 'Search Results/SearchResultTable',
  component: SearchResultTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => (
  <SearchResultTable
    api={text('api', 'assets')}
    query={text('query', '')}
    onRowClick={action('onRowClick')}
    filter={{}}
  />
);

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;
