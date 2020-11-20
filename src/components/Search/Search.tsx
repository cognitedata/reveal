import React, { ChangeEvent, useState } from 'react';
import { Drawer, Icon, Input } from '@cognite/cogs.js';
import {
  selectActiveChartId,
  selectSearchVisibility,
} from 'reducers/search/selectors';
import useSelector from 'hooks/useSelector';
import useDispatch from 'hooks/useDispatch';
import searchSlice from 'reducers/search/slice';
import styled from 'styled-components/macro';
import { Timeseries } from '@cognite/sdk';
import chartsSlice from 'reducers/charts';
import useTimeSeriesSearch from './useTimeSeriesSearch';

const SEARCH_RESULT_LIMIT = 20;

const LoadingContainer = styled.div`
  text-align: center;
  margin: 1rem;
`;

const SearchResultsContainer = styled.div`
  margin-top: 1rem;
`;

const SearchResult = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  width: 100%;
  height: 2.5rem;
  padding: 5px;

  cursor: pointer;

  & > :last-child {
    visibility: hidden;
  }

  &:hover {
    background: var(--cogs-greyscale-grey2);

    & > :last-child {
      visibility: visible;
    }
  }
`;

const SearchResultIcon = styled.span`
  display: flex;
  align-items: center;
  padding-left: 0.2rem;
  padding-right: 1rem;
`;

const SearchResultText = styled.span`
  display: flex;
  align-items: center;
`;

const SearchResultActions = styled.span`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.2rem;
`;

const Search = () => {
  const dispatch = useDispatch();
  const isVisible = useSelector(selectSearchVisibility);
  const activeChartId = useSelector(selectActiveChartId);
  const [searchInputValue, setSearchInputValue] = useState('');

  const handleCancel = () => {
    dispatch(searchSlice.actions.hideSearch());
  };

  const {
    searchResults: timeseriesSearchResults,
    searchFunction: timeseriesSearch,
    isSearching: isSearchingTimeseries,
    clearResults: clearTimeseriesResults,
  } = useTimeSeriesSearch();

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchInputValue(value);
    if (!value) {
      clearTimeseriesResults();
      return;
    }
    timeseriesSearch({ search: { query: value }, limit: SEARCH_RESULT_LIMIT });
  };

  const handleTimeSeriesClick = (timeseries: Timeseries) => {
    dispatch(
      chartsSlice.actions.addTimeSeries({
        id: activeChartId,
        timeSeriesId: String(timeseries.externalId),
      })
    );
  };

  const resultElements = timeseriesSearchResults.map((timeseries) => {
    return (
      <SearchResult
        key={timeseries.id}
        onClick={() => handleTimeSeriesClick(timeseries)}
      >
        <SearchResultIcon>
          <Icon type="LineChart" />
        </SearchResultIcon>
        <SearchResultText>{timeseries.name}</SearchResultText>
        <SearchResultActions>
          <Icon type="Plus" />
        </SearchResultActions>
      </SearchResult>
    );
  });

  return (
    <Drawer
      visible={isVisible}
      title="Search"
      width={500}
      placement="left"
      footer={null}
      onCancel={handleCancel}
    >
      <Input
        fullWidth
        icon="Search"
        placeholder="Find time series to plot"
        onChange={handleSearchInputChange}
        value={searchInputValue}
      />
      <LoadingContainer>
        {isSearchingTimeseries && <Icon type="Loading" />}
      </LoadingContainer>
      <SearchResultsContainer>{resultElements}</SearchResultsContainer>
    </Drawer>
  );
};

export default Search;
