import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { SearchBox } from 'components/Filters';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useFilterDataNpt } from 'modules/inspectTabs/selectors';

import { NPT_NAME_FILTER_PLACEHOLDER } from './constants';

export const NPTFilterByName = () => {
  const { searchPhrase } = useFilterDataNpt();
  const dispatch = useDispatch();

  const handleFilterByName = useCallback(
    (name: string) => {
      if (searchPhrase === name) return;
      dispatch(inspectTabsActions.setNptSearchPhrase(name));
    },
    [searchPhrase]
  );

  return (
    <SearchBox
      placeholder={NPT_NAME_FILTER_PLACEHOLDER}
      value={searchPhrase}
      onSearch={handleFilterByName}
    />
  );
};
