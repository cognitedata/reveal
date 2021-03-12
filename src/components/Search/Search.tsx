import React, { ChangeEvent, useState } from 'react';
import { Button, Input, Tooltip } from '@cognite/cogs.js';
import { SearchResultTable } from 'components/SearchResultTable';
import styled from 'styled-components/macro';
import { Timeseries } from '@cognite/sdk';
import { useDebounce } from 'use-debounce/lib';

type SearchProps = {
  visible: boolean;
  onClose?: () => void;
};

const Search = ({ visible, onClose }: SearchProps) => {
  // const { chartId } = useParams<{ chartId: string }>();
  const [searchInputValue, setSearchInputValue] = useState('');
  const [debouncedQuery] = useDebounce(searchInputValue, 100);

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchInputValue(value);
  };

  const handleTimeSeriesClick = async (timeseries: Timeseries) => {
    // dispatch(addTimeSeriesToChart(activeChartId, timeseries));
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
            />
          </div>
          <Tooltip content="Hide">
            <Button icon="Close" variant="ghost" onClick={onClose} />
          </Tooltip>
        </SearchBar>
        <SearchResultsContainer>
          <SearchResultTable
            query={debouncedQuery}
            onTimeseriesClick={handleTimeSeriesClick}
          />
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
  overflow-y: hidden;
`;

export default Search;
