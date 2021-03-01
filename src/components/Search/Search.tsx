import React, { ChangeEvent, useState } from 'react';
import { Drawer, Input } from '@cognite/cogs.js';
import {
  selectActiveChartId,
  selectSearchVisibility,
} from 'reducers/search/selectors';
import { SearchResultTable } from 'components/SearchResultTable';
import useSelector from 'hooks/useSelector';
import useDispatch from 'hooks/useDispatch';
import searchSlice from 'reducers/search/slice';
import styled from 'styled-components/macro';
import { Timeseries } from '@cognite/sdk';
import { addTimeSeriesToChart } from 'reducers/charts/api';
import { useDebounce } from 'use-debounce/lib';

const SearchResultsContainer = styled.div`
  margin-top: 1rem;
  height: calc(100% - 70px);
  overflow-y: hidden;
`;

const Search = () => {
  const dispatch = useDispatch();
  const isVisible = useSelector(selectSearchVisibility);
  const activeChartId = useSelector(selectActiveChartId);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [debouncedQuery] = useDebounce(searchInputValue, 100);

  const handleCancel = () => {
    dispatch(searchSlice.actions.hideSearch());
  };

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchInputValue(value);
  };

  const handleTimeSeriesClick = async (timeseries: Timeseries) => {
    dispatch(addTimeSeriesToChart(activeChartId, timeseries));
  };

  return (
    <Drawer
      visible={isVisible}
      title="Search"
      width={1010}
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
      <SearchResultsContainer>
        <SearchResultTable
          query={debouncedQuery}
          onTimeseriesClick={handleTimeSeriesClick}
        />
      </SearchResultsContainer>
    </Drawer>
  );
};

export default Search;
