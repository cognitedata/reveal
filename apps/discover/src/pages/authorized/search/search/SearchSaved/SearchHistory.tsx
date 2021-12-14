import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import get from 'lodash/get';

import { AutoComplete, OptionType, Icon } from '@cognite/cogs.js';

import { useCurrentSavedSearchState } from 'hooks/useCurrentSavedSearchState';
import { useFormatDocumentFilters } from 'modules/api/documents/hooks/useDocumentFormatFilter';
import { useSavedSearch } from 'modules/api/savedSearches/hooks';
import { useSetQuery } from 'modules/api/savedSearches/hooks/useClearQuery';
import { SavedSearchContent } from 'modules/api/savedSearches/types';
import { useSearchState } from 'modules/search/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';
import { AppliedFilterEntries } from 'modules/sidebar/types';
import { useFormatWellFilters } from 'modules/wellSearch/hooks/useAppliedFilters';
import { FlexColumn, FlexGrow } from 'styles/layout';

import { SearchQueryInfoPanel } from '../SearchQueryInfoPanel';

import { SEARCH_HISTORY_DISPLAY_COUNT } from './constants';
import {
  Filters,
  SearchHistoryRow,
  SearchPhrase,
  IconWrapper,
  SearchHistoryContainer,
} from './elements';
import { useSearchHistoryOptionData } from './hooks/useSearchHistoryOptionData';
import { useUpdateSearchHistoryListQuery } from './hooks/useUpdateSearchHistoryListQuery';
import { formatAllFiltersToAString } from './utils';

export interface SearchHistoryOptionType<ValueType>
  extends OptionType<ValueType> {
  data: SavedSearchContent;
}

export const SearchHistory: React.FC = () => {
  const { t } = useTranslation('Search');
  const history = useHistory();
  const state = useSearchState();
  const [fastValue, setFastValue] = useState<string>(); // The state of typing the value into input (should be debounced and used for getting result).
  const [value, setValue] = useState<OptionType<string>>(); // the state of selecting a input (the actual search query string):

  const formattedDocumentFilters = useFormatDocumentFilters();
  const formattedWellFilters = useFormatWellFilters();
  const setQuery = useSetQuery();
  const loadSavedSearch = useSavedSearch();
  const searchPhrase = useSearchPhrase();
  const currentSavedSearch = useCurrentSavedSearchState();
  const updateSearchHistoryListQuery = useUpdateSearchHistoryListQuery();
  const searchHistoryOptionData = useSearchHistoryOptionData();

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

  const getFilterText = (savedSearch: SavedSearchContent) => {
    const documentFacetList = formattedDocumentFilters(
      Object.entries(
        savedSearch.filters?.documents?.facets || []
      ) as AppliedFilterEntries[]
    );

    const wellFilterList = formattedWellFilters(
      savedSearch.filters?.wells || {}
    );

    return formatAllFiltersToAString(
      documentFacetList,
      wellFilterList,
      savedSearch.geoJson || []
    );
  };

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

    return (
      <SearchHistoryRow>
        <FlexColumn>
          <SearchPhrase>{option.data?.query}</SearchPhrase>
          <Filters>
            {option.data?.filters
              ? getFilterText(option.data)
              : 'No filters were applied'}
          </Filters>
        </FlexColumn>
        <FlexGrow />
        <IconWrapper>
          <Icon type="History" />
        </IconWrapper>
      </SearchHistoryRow>
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
    />
  );
  return (
    <SearchHistoryContainer data-testid="main-search-input">
      {renderSearchInput()}
      <SearchQueryInfoPanel />
    </SearchHistoryContainer>
  );
};
