import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { SearchResults } from './SearchResults';

export default {
  title: 'Search Results/SearchResults',
  component: SearchResults,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  const [currentResourceType, setCurrentResourceType] = useState('asset');
  const selected = select<ResourceType>(
    'api',
    ['asset', 'timeSeries', 'sequence', 'file', 'event'],
    'asset'
  );
  useEffect(() => {
    setCurrentResourceType(selected);
  }, [selected]);
  return (
    <SearchResults
      currentResourceType={currentResourceType}
      setCurrentResourceType={type => {
        action('setCurrentResourceType')(type);
        setCurrentResourceType(type);
      }}
    />
  );
};

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;
