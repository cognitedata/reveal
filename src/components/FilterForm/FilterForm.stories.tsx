import React, { useState } from 'react';
import styled from 'styled-components';
import { FilterForm } from './FilterForm';

export default {
  title: 'Component/FilterForm',
  component: FilterForm,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: {
    metadata: {
      type: 'object',
    },
    metadataCategory: {
      type: 'object',
    },
    lockedFilters: {
      type: 'array',
    },
  },
};

export const Example = args => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return <FilterForm filters={filters} setFilters={setFilters} {...args} />;
};
Example.args = {
  metadata: {
    testing: ['yay', 'ayy2'],
    'Should Work': ['Yepp', 'asdfa asdf '],
  },
  metadataCategory: {},
  lockedFilters: [],
};

export const ExampleWithCategories = args => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return <FilterForm filters={filters} setFilters={setFilters} {...args} />;
};
ExampleWithCategories.args = {
  metadata: {
    top_level: ['yay', 'ayy2'],
    testing: ['yay', 'ayy2'],
    testing2: ['2yay', '2ayy2'],
    'Should Work': ['Yepp', 'asdfa asdf '],
  },
  metadataCategory: {
    testing: 'Cat 1',
    testing2: 'Cat 1',
    'Should Work': 'Cat 2',
  },
  lockedFilters: [],
};

export const ExampleWithLockedCategories = args => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return <FilterForm filters={filters} setFilters={setFilters} {...args} />;
};
ExampleWithLockedCategories.args = {
  metadata: {
    top_level: ['yay', 'ayy2'],
    testing: ['yay', 'ayy2'],
    testing2: ['2yay', '2ayy2'],
    'Should Work': ['Yepp', 'asdfa asdf '],
  },
  metadataCategory: {
    testing: 'Cat 1',
    testing2: 'Cat 1',
    'Should Work': 'Cat 2',
  },
  lockedFilters: ['testing'],
};

const Container = styled.div`
  width: 300px;
`;
