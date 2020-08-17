import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Input } from '@cognite/cogs.js';
import { GlobalSearchResults } from './GlobalSearchResults';

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
  padding: 16px;
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
  showSearch?: boolean;
};

export const GlobalSearchField = ({
  offsetTop = 0,
  showSearch: propShowSearch,
}: Props) => {
  const [query, setQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const onResourceSelected = useCallback(() => {
    setShowSearchResults(false);
  }, []);

  useEffect(() => {
    window.addEventListener('Resource Selected', onResourceSelected);
    return () =>
      window.removeEventListener('Resource Selected', onResourceSelected);
  }, [onResourceSelected]);

  useEffect(() => {
    if (propShowSearch) {
      setShowSearchResults(propShowSearch);
    }
  }, [propShowSearch]);

  return (
    <>
      <Overlay
        visible={showSearchResults}
        onClick={() => setShowSearchResults(false)}
      />
      <SearchWrapper>
        <SearchBar
          variant="noBorder"
          icon="Search"
          containerStyle={{
            flex: 1,
            width: showSearchResults ? '100%' : '340px',
          }}
          style={{ width: '100%' }}
          iconPlacement="left"
          placeholder="Search for a file or asset..."
          onChange={ev => setQuery(ev.target.value)}
          onClick={() => setShowSearchResults(true)}
          value={query}
        />
        <ResultList visible={showSearchResults} offsetTop={offsetTop}>
          <GlobalSearchResults query={query} />
        </ResultList>
      </SearchWrapper>
    </>
  );
};
