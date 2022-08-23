import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import get from 'lodash/get';
import { AutoComplete, OptionType } from '@cognite/cogs.js';

import { useDocumentSearchDispatch } from '../../providers';
import { SearchQueryInfoPanel } from '../SearchQueryInfoPanel';

import { SearchHistoryContainer, customStyles } from './elements';
import { SearchValueContainer } from './SearchBar/SearchValueContainer';

export const SearchInput: React.FC = () => {
  const history = useHistory();
  // const state = useSearchState();
  const [fastValue, setFastValue] = useState<string>(); // The state of typing the value into input (should be debounced and used for getting result).
  const [value, setValue] = useState<OptionType<string>>(); // the state of selecting a input (the actual search query string):

  const { setSearchPhrase } = useDocumentSearchDispatch();

  const handleSearchInput = (e: any, { action }: any) => {
    // Shouldn't update input value on menu close if still focussed on input
    if (action !== 'menu-close') {
      setFastValue(e);
    }
  };

  const updateSearchValue = (inputString: string) => {
    // setQuery(inputString);
    setSearchPhrase(inputString);
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

  const handleEnterPressOrSelect = (input: any, { action }: any) => {
    // if (action === 'select-option' && input) {
    //   loadSavedSearch(input.data);
    // }

    // check for other actions ...
    if (['clear'].includes(action)) {
      clearSearchValue();
    }
  };

  const mainValue = useMemo(() => {
    return value?.value ? { label: value?.value, value: value?.value } : '';
  }, [value]);

  const formatOptionLabel = (option: any, labelMeta: any) => {
    /**
     * Expression: get(option, '__isNew__')
     * To prevent `formatCreateLabel` get overridden by this funciton. Type not exposed though.
     * https://github.com/JedWatson/react-select/issues/4260
     *
     * Expression: labelMeta.context === 'value'
     * New option ( typed in ) should not get styled as a option
     */
    if (get(option, '__isNew__') || labelMeta.context === 'value') {
      return option.label;
    }

    return null;
  };

  const formatCreateLabel = (userInput: string) =>
    userInput ? `Search for "${userInput}"` : 'Press Enter to start searching';

  const renderSearchInput = () => (
    <AutoComplete
      mode="async"
      isClearable
      // disabled={state.isSearching}
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
      placeholder="Search"
      theme="grey"
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
