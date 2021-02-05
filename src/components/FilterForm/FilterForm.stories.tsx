import React, { useState } from 'react';
import styled from 'styled-components';
import { object, array } from '@storybook/addon-knobs';
import { FilterForm } from './FilterForm';

export default {
  title: 'Component/FilterForm',
  component: FilterForm,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return (
    <FilterForm
      metadata={object('metadata', {
        testing: ['yay', 'ayy2'],
        'Should Work': ['Yepp', 'asdfa asdf '],
      })}
      metadataCategory={object('metadataCategory', {})}
      lockedFilters={array('lockedFilters', [])}
      filters={filters}
      setFilters={setFilters}
    />
  );
};
export const ExampleWithCategories = () => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return (
    <FilterForm
      metadata={object('metadata', {
        top_level: ['yay', 'ayy2'],
        testing: ['yay', 'ayy2'],
        testing2: ['2yay', '2ayy2'],
        'Should Work': ['Yepp', 'asdfa asdf '],
      })}
      metadataCategory={object('metadataCategory', {
        testing: 'Cat 1',
        testing2: 'Cat 1',
        'Should Work': 'Cat 2',
      })}
      lockedFilters={array('lockedFilters', [])}
      filters={filters}
      setFilters={setFilters}
    />
  );
};
export const ExampleWithLockedCategories = () => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return (
    <FilterForm
      filters={filters}
      setFilters={setFilters}
      metadata={object('metadata', {
        top_level: ['yay', 'ayy2'],
        testing: ['yay', 'ayy2'],
        testing2: ['2yay', '2ayy2'],
        'Should Work': ['Yepp', 'asdfa asdf '],
      })}
      metadataCategory={object('metadataCategory', {
        testing: 'Cat 1',
        testing2: 'Cat 1',
        'Should Work': 'Cat 2',
      })}
      lockedFilters={array('lockedFilters', ['testing'])}
    />
  );
};

const Container = styled.div`
  padding: 20px;
  height: 400px;
  width: 600px;
  background: grey;
  display: flex;
  justify-content: center;
  align-items: center;
`;
