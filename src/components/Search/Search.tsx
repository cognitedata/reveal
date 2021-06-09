import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, Input, Tooltip } from '@cognite/cogs.js';
import SearchResultList from 'components/SearchResultTable/SearchResultList';
import styled from 'styled-components/macro';
import { SEARCH_KEY } from 'utils/constants';
import { useSearchParam } from 'hooks';
import debounce from 'lodash/debounce';

type SearchProps = {
  visible: boolean;
  onClose?: () => void;
};

const Search = ({ visible, onClose }: SearchProps) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [urlQuery = '', setUrlQuery] = useSearchParam(SEARCH_KEY, false);
  const debouncedSetUrlQuery = debounce(setUrlQuery, 200);

  useEffect(() => {
    if (searchInputValue !== urlQuery) {
      setSearchInputValue(urlQuery);
    }
    // Should NOT run when searchInputValue changes
    // eslint-disable-next-line
  }, [urlQuery, setSearchInputValue]);

  useEffect(() => {
    if (searchInputValue !== urlQuery) {
      debouncedSetUrlQuery(encodeURIComponent(searchInputValue));
    }
    return () => debouncedSetUrlQuery.cancel();
  }, [searchInputValue, urlQuery, debouncedSetUrlQuery]);

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchInputValue(value);
  };

  return (
    <SearchContainer visible={visible}>
      <ContentWrapper visible={visible}>
        <SearchBar>
          <div style={{ flexGrow: 1 }}>
            <Input
              fullWidth
              icon="Search"
              placeholder="Find time series to plot"
              onChange={handleSearchInputChange}
              value={searchInputValue}
              size="large"
              clearable={{
                labelText: 'Clear text',
                callback: () => {
                  setSearchInputValue('');
                },
              }}
              autoFocus
            />
          </div>
          <Tooltip content="Hide">
            <Button
              icon="Close"
              type="ghost"
              onClick={onClose}
              aria-label="close"
            />
          </Tooltip>
        </SearchBar>
        <SearchResultsContainer>
          <SearchResultList query={urlQuery} />
        </SearchResultsContainer>
      </ContentWrapper>
    </SearchContainer>
  );
};

const SearchContainer = styled.div<SearchProps>`
  height: 100%;
  border-right: 1px solid var(--cogs-greyscale-grey4);
  width: ${(props) => (props.visible ? '30%' : 0)};
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  padding: ${(props) => (props.visible ? '20px 0 10px 10px' : 0)};
  transition: visibility 0s linear 200ms, width 200ms ease;
`;

const ContentWrapper = styled.div<SearchProps>`
  height: 100%;
  width: 100%;
  opacity: ${(props) => (props.visible ? 1 : 0)};
`;

const SearchBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SearchResultsContainer = styled.div`
  margin-top: 1rem;
  height: calc(100% - 70px);
  overflow: hidden;
  width: 100%;
`;

export default Search;
