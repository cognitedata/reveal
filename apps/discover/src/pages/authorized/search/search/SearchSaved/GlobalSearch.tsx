import { useSavedSearch } from 'domain/savedSearches/internal/hooks';
import { useSetQuery } from 'domain/savedSearches/internal/hooks/useClearQuery';
import { useSearchHistoryAppliedFilters } from 'domain/searchHistory/internal/hooks/useSearchHistoryAppliedFilters';
import { useSearchHistoryOptionData } from 'domain/searchHistory/internal/hooks/useSearchHistoryOptionData';
import { useUpdateSearchHistoryListQuery } from 'domain/searchHistory/internal/hooks/useUpdateSearchHistoryListQuery';
import { SearchHistoryOptionType } from 'domain/searchHistory/internal/types';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import get from 'lodash/get';

import { AutoComplete, OptionType } from '@cognite/cogs.js';
import { PerfMetrics } from '@cognite/metrics';

import { SearchValueContainer } from 'components/SearchBar/SearchValueContainer';
import {
  SEARCH_HISTORY_TRACK_ID,
  SEARCH_ID,
  SEARCH_TRACK_ID,
} from 'constants/metrics';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useSearchState } from 'modules/search/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';
import { useCurrentSavedSearchState } from 'modules/sidebar/selectors/useCurrentSavedSearchState';

import { SearchQueryInfoPanel } from '../SearchQueryInfoPanel';

import { SearchHistory } from './components/SearchHistory';
import { SEARCH_HISTORY_DISPLAY_COUNT } from './constants';
import { SearchHistoryContainer, customStyles } from './elements';

export const GlobalSearch: React.FC = () => {
  const { t } = useTranslation('Search');
  const history = useHistory();
  const state = useSearchState();
  const [fastValue, setFastValue] = useState<string>(); // The state of typing the value into input (should be debounced and used for getting result).
  const [value, setValue] = useState<OptionType<string>>(); // the state of selecting a input (the actual search query string):

  const setQuery = useSetQuery();
  const loadSavedSearch = useSavedSearch();
  const searchPhrase = useSearchPhrase();
  const currentSavedSearch = useCurrentSavedSearchState();
  const getSearchHistoryFilters = useSearchHistoryAppliedFilters();
  const updateSearchHistoryListQuery = useUpdateSearchHistoryListQuery();
  const searchHistoryOptionData = useSearchHistoryOptionData();
  const metrics = useGlobalMetrics(SEARCH_ID);

  useEffect(() => setSearchValues(searchPhrase), [searchPhrase]);

  useEffect(
    () => updateSearchHistoryListQuery(),
    [JSON.stringify(currentSavedSearch)]
  );

  const loadOptions = (_input: string, callback: (options: any) => void) => {
    setTimeout(() => {
      callback(searchHistoryOptionData);
    }, 1000);
  };

  const handleSearchInput = (e: any, { action }: any) => {
    // Shouldn't update input value on menu close if still focussed on input
    if (action !== 'menu-close') {
      setFastValue(e);
    }
  };

  const updateSearchValue = (inputString: string) => {
    if (inputString) {
      metrics.track(SEARCH_TRACK_ID);
    }

    PerfMetrics.trackPerfStart('SEARCH_ACTION_DATA_UPDATED', 'SEARCH');

    setQuery(inputString);
    setSearchValues(inputString);
  };

  const setSearchValues = (searchValue: string) => {
    setValue({
      label: searchValue,
      value: searchValue,
    });
    setFastValue(searchValue);
  };

  const clearSearchValue = () => {
    PerfMetrics.trackPerfStart('SEARCH_ACTION_DATA_UPDATED', 'SEARCH');

    updateSearchValue('');
    history.push({
      search: '',
    });
  };

  const handleEnterPressOrSelect = (
    input: SearchHistoryOptionType<string>,
    { action }: any
  ) => {
    if (action === 'select-option' && input) {
      metrics.track(SEARCH_HISTORY_TRACK_ID);
      loadSavedSearch(input.data);
    }

    // check for other actions ...
    if (['clear'].includes(action)) {
      clearSearchValue();
    }
  };

  const mainValue = useMemo(() => {
    return value?.value ? { label: value?.value, value: value?.value } : '';
  }, [value]);

  const formatOptionLabel = (
    option: SearchHistoryOptionType<string>,
    labelMeta: any
  ) => {
    /**
     * Expression: get(option, '__isNew__')
     * To prevent `formatCreateLabel` get overridden by this funciton. Type not exposed though.
     * https://github.com/JedWatson/react-select/issues/4260
     *
     * Expression: labelMeta.context === 'value'
     * New option ( typed in ) should not get styled as a option
     */
    if (get(option, '__isNew__') || labelMeta.context === 'value')
      return option.label;

    const { filters, count } = getSearchHistoryFilters(option.data);

    return (
      <SearchHistory
        query={option.data?.query}
        filters={filters}
        count={count}
      />
    );
  };

  const formatCreateLabel = (userInput: string) =>
    userInput
      ? `${t('Search for')} "${userInput}"`
      : t('Press Enter to start searching');

  const defaultOptions = useMemo(
    () => searchHistoryOptionData.slice(0, SEARCH_HISTORY_DISPLAY_COUNT),
    [searchHistoryOptionData]
  );

  const renderSearchInput = () => (
    <AutoComplete
      mode="async"
      isClearable
      disabled={state.isSearching}
      createOptionPosition="first"
      value={mainValue}
      onInputChange={handleSearchInput}
      inputValue={fastValue}
      allowCreateWhileLoading
      autosize={false}
      onCreateOption={updateSearchValue}
      onChange={handleEnterPressOrSelect}
      components={{
        DropdownIndicator: () => null,
        ValueContainer: SearchValueContainer,
      }}
      onFocus={() => {
        setFastValue(value?.value);
      }}
      formatCreateLabel={formatCreateLabel}
      formatOptionLabel={formatOptionLabel}
      placeholder={t('Search')}
      theme="grey"
      loadOptions={loadOptions}
      defaultOptions={defaultOptions}
      styles={customStyles}
    />
  );
  return (
    <SearchHistoryContainer data-testid="main-search-input">
      {renderSearchInput()}
      <SearchQueryInfoPanel />
    </SearchHistoryContainer>
  );
};
