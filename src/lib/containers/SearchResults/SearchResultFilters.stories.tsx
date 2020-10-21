import React from 'react';
import styled from 'styled-components';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { SearchResultFilters } from './SearchResultFilters';

export default {
  title: 'Search Results/SearchResultFilters',
  component: SearchResultFilters,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <SearchResultFilters
      currentResourceType={select<ResourceType>(
        'api',
        ['asset', 'timeSeries', 'sequence', 'file', 'event'],
        'asset'
      )}
    />
  );
};

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;
