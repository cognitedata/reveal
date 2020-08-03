import React, { useState } from 'react';
import styled from 'styled-components';
import { SearchFilterSection } from './SearchFilterSection';

export default { title: 'Organisms|SearchFilterSection' };

export const Example = () => {
  const [filters, setFilters] = useState<{
    [key: string]: string;
  }>({ testing: 'yay' });
  return (
    <Container>
      <SearchFilterSection
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
      <SearchFilterSection
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
      <SearchFilterSection
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
  justify-content: start;
  align-items: center;
`;
