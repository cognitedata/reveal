import React from 'react';
import { useDispatch } from 'react-redux';

import { SearchBox } from 'components/filters';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataNpt } from 'modules/filterData/selectors';

import { NPT_NAME_FILTER_PLACEHOLDER } from './constants';

export const NPTFilterByName = React.memo(() => {
  const { searchPhrase } = useFilterDataNpt();
  const dispatch = useDispatch();

  const handleFilterByName = (name: string) => {
    if (searchPhrase === name) return;
    dispatch(filterDataActions.setNptSearchPhrase(name));
  };

  return (
    <SearchBox
      placeholder={NPT_NAME_FILTER_PLACEHOLDER}
      value={searchPhrase}
      onSearch={handleFilterByName}
    />
  );
});
