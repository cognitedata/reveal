import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Input, Button } from '@cognite/cogs.js';
import { useQuery } from 'context/ResourceSelectionContext';
import { SearchResults } from 'containers/SearchResults';

const Overlay = styled.div<{ visible: boolean }>`
  display: ${props => (props.visible ? 'block' : 'none')};
  position: fixed;
  top: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  z-index: 2;
`;

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

const ResultList = styled.div<{ visible: boolean; offsetTop: number }>`
  position: fixed;
  height: ${props =>
    props.visible ? `calc(100vh - ${props.offsetTop}px)` : 0};
  top: ${props => `${props.offsetTop}px`};
  left: 0;
  width: 100vw;
  z-index: 3;
  transition: 0.3s all;
  overflow: hidden;
  background: white;
  padding-top: ${props => (props.visible ? '16px' : '0px')};
  padding-bottom: ${props => (props.visible ? '16px' : '0px')};
  overflow: auto;
  display: flex;
  flex-direction: column;
  margin-bottom: ${props => (props.visible ? '24px' : '0px')};

  small {
    background: #fff;
    padding: 6px 8px;
    display: block;
    font-weight: 700;
  }
`;

type Props = {
  offsetTop?: number;
  disableDropdown?: boolean;
};

export const ExplorationSearchBar = ({
  offsetTop = 0,
  disableDropdown = false,
}: Props) => {
  const [query, setQuery] = useQuery();
  const [showSearchResults, setShowSearchResults] = useState(false);

  const onResourceSelected = useCallback(() => {
    setShowSearchResults(false);
  }, []);

  useEffect(() => {
    window.addEventListener('Resource Selected', onResourceSelected);
    return () =>
      window.removeEventListener('Resource Selected', onResourceSelected);
  }, [onResourceSelected]);

  return (
    <>
      <Overlay
        visible={!disableDropdown && showSearchResults}
        onClick={() => setShowSearchResults(false)}
      />
      <SearchWrapper>
        <SearchBar
          variant="noBorder"
          icon="Search"
          containerStyle={{
            flex: 1,
            width: disableDropdown || showSearchResults ? '100%' : '340px',
          }}
          style={{ width: '100%' }}
          iconPlacement="left"
          placeholder="Search for a file or asset..."
          onChange={ev => setQuery(ev.target.value)}
          onClick={() => setShowSearchResults(true)}
          value={query}
        />
        <ResultList
          visible={!disableDropdown && showSearchResults}
          offsetTop={offsetTop}
        >
          <Button
            style={{ position: 'absolute', top: 24, right: 24, zIndex: 2 }}
            icon="Close"
            onClick={() => setShowSearchResults(false)}
          />
          <SearchResults />
        </ResultList>
      </SearchWrapper>
    </>
  );
};
