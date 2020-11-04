import React from 'react';
import styled from 'styled-components';
import { Input } from '@cognite/cogs.js';
import { useQuery } from 'lib/context/ResourceSelectionContext';

const SearchWrapper = styled.div`
  z-index: 3;
  width: auto;
  flex: 1;
  position: relative;
`;

const SearchBar = styled(Input)`
  width: 340px;
  display: flex;
  transition: 0.3s all;

  .addons-input-wrapper,
  .input-wrapper,
  input {
    width: 100%;
  }

  &&& input:hover,
  &&& input:focus {
    box-shadow: none;
  }
`;

export const ExplorationSearchBar = () => {
  const [query, setQuery] = useQuery();

  return (
    <>
      <SearchWrapper>
        <SearchBar
          variant="noBorder"
          icon="Search"
          containerStyle={{
            flex: 1,
            width: '100%',
          }}
          style={{ width: '100%' }}
          iconPlacement="left"
          placeholder="Search for a file or asset..."
          onChange={ev => setQuery(ev.target.value)}
          value={query}
        />
      </SearchWrapper>
    </>
  );
};
