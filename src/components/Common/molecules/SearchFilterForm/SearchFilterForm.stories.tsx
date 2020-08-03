import React, { useState } from 'react';
import styled from 'styled-components';
import { SearchFilterForm } from './SearchFilterForm';

export default { title: 'Molecules|SearchFilterForm' };

export const Example = () => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return (
    <Container>
      <SearchFilterForm
        metadata={{
          testing: ['yay', 'ayy2'],
          'Should Work': ['Yepp', 'asdfa asdf '],
        }}
        filters={filters}
        setFilters={setFilters}
      />
    </Container>
  );
};
export const ExampleWithCategories = () => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return (
    <Container>
      <SearchFilterForm
        metadata={{
          top_level: ['yay', 'ayy2'],
          testing: ['yay', 'ayy2'],
          testing2: ['2yay', '2ayy2'],
          'Should Work': ['Yepp', 'asdfa asdf '],
        }}
        metadataCategory={{
          testing: 'Cat 1',
          testing2: 'Cat 1',
          'Should Work': 'Cat 2',
        }}
        filters={filters}
        setFilters={setFilters}
      />
    </Container>
  );
};
export const ExampleWithLockedCategories = () => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return (
    <Container>
      <SearchFilterForm
        metadata={{
          top_level: ['yay', 'ayy2'],
          testing: ['yay', 'ayy2'],
          testing2: ['2yay', '2ayy2'],
          'Should Work': ['Yepp', 'asdfa asdf '],
        }}
        metadataCategory={{
          testing: 'Cat 1',
          testing2: 'Cat 1',
          'Should Work': 'Cat 2',
        }}
        lockedFilters={['testing']}
        filters={filters}
        setFilters={setFilters}
      />
    </Container>
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
