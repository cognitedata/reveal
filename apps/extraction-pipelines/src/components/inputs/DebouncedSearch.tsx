import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { Input } from '@cognite/cogs.js';
import { useDebounce } from 'hooks/useDebounce';
import styled from 'styled-components';
import {
  updateSearchAction,
  useRunFilterContext,
} from 'hooks/runs/RunsFilterContext';

export const SearchWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

interface ErrorMessageSearchProps {
  label: string;
  placeholder: string;
  debounceTime?: number;
}

export const DebouncedSearch: FunctionComponent<ErrorMessageSearchProps> = ({
  label,
  placeholder,
  debounceTime = 500,
}: PropsWithChildren<ErrorMessageSearchProps>) => {
  const {
    state: { search },
    dispatch,
  } = useRunFilterContext();
  const [searchString, setSearchString] = useState(search);
  useEffect(() => {
    setSearchString(search);
  }, [search, setSearchString]);
  const debouncedValue = useDebounce(searchString, debounceTime);

  useEffect(() => {
    dispatch(updateSearchAction(debouncedValue));
  }, [debouncedValue, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
  };

  return (
    <Input
      id="error-message-search"
      name="error-message-search"
      type="search"
      placeholder={placeholder}
      icon="Search"
      iconPlacement="right"
      value={searchString}
      onChange={onChange}
      aria-label={label}
      fullWidth
    />
  );
};
