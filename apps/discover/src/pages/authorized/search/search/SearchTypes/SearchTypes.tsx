import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { AutoComplete, OptionType } from '@cognite/cogs.js';

import { useDebounce } from 'hooks/useDebounce';
import { useSetQuery } from 'modules/api/savedSearches/hooks/useClearQuery';
import { documentSearchActions } from 'modules/documentSearch/actions';
import { useDocuments } from 'modules/documentSearch/selectors';
import { useSearchState } from 'modules/search/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';

import { SearchTypesContainer } from '../elements';
import { SearchQueryInfoPanel } from '../SearchQueryInfoPanel';

export const SearchTypes: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Search');
  const history = useHistory();
  const state = useSearchState();
  const [fastValue, setFastValue] = useState<string>(); // The state of typing the value into input (should be debounced and used for getting result).
  const [value, setValue] = useState<OptionType<string>>(); // the state of selecting a input (the actual search query string):

  const searchState = useDocuments();
  const suggestions = searchState.typeAheadResults || [];

  const [documentOptions, setDocumentOptions] = useState<OptionType<string>[]>(
    []
  );

  const setQuery = useSetQuery();
  const searchPhrase = useSearchPhrase();

  const searchInputRef = useRef<HTMLDivElement | undefined>();

  useEffect(() => {
    setSearchValues(searchPhrase);
  }, [searchPhrase]);

  const getSuggestions = (): OptionType<string>[] => {
    return [
      {
        label: 'documents',
        options: documentOptions,
      },
      {
        label: 'seismic',
        options: [],
      },
    ];
  };

  /**
   *
   * @param searchExecute
   * Skip search execution on typehead changes as execution will happen on current search change
   * Solution to avoid calling search two times.
   */
  const updateSearchValue = (inputString: string) => {
    setQuery(inputString);
    setSearchValues(inputString);
    loseFocus();
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

  const loseFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.getElementsByTagName('input')[0].blur();
    }
  };

  const loadOptions = (_input: string, callback: (options: any) => void) => {
    setTimeout(() => {
      callback(getSuggestions());
    }, 1000);
  };

  const debounceInputChange = useDebounce((newValue: string) => {
    // INFO: this was dispatching an empty search after the input was focused out. I think that is unnecessary so I added this check here
    if (newValue !== '') {
      dispatch(documentSearchActions.getTypeahead(newValue));
    }
  }, 500);

  const handleEnterPressOrSelect = (input: any, { action }: any) => {
    if (action === 'select-option' && input) {
      updateSearchValue(input.value);
    }

    // check for other actions ...
    if (['clear'].includes(action)) {
      clearSearchValue();
    }
  };

  const handleSearchInput = (e: any, { action }: any) => {
    // Shouldn't update input value on menu close if still focussed on input
    if (action !== 'menu-close') {
      debounceInputChange(e);
      setFastValue(e);
    }
  };

  // Extract this to a separate hook called 'useTypeaheadDocument'
  useEffect(() => {
    if (suggestions.length > 0) {
      const map = suggestions.map((suggestion: any) => {
        return {
          label: suggestion.doc.filename,
          value: suggestion.doc.filename,
        };
      });
      setDocumentOptions(map);
    }
  }, [suggestions]);

  const mainValue = value?.value
    ? { label: value?.value, value: value?.value }
    : '';

  const renderSearchInput = React.useMemo(
    () => (
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
          // eslint-disable-next-line lodash/prefer-constant
          DropdownIndicator: () => null,
        }}
        onFocus={() => {
          setFastValue(value?.value);
        }}
        formatCreateLabel={(userInput: string) =>
          userInput
            ? `${t('Search for')} "${userInput}"`
            : t('Press Enter to start searching')
        }
        placeholder={t('Search')}
        theme="grey"
        loadOptions={loadOptions}
      />
    ),
    [fastValue, mainValue]
  );

  return (
    <SearchTypesContainer data-testid="main-search-input" ref={searchInputRef}>
      {renderSearchInput}
      <SearchQueryInfoPanel />
    </SearchTypesContainer>
  );
});
