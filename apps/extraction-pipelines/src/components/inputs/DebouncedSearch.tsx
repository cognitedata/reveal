import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { Input } from '@cognite/cogs.js';
import { useDebounce } from 'hooks/useDebounce';
import styled from 'styled-components';

export const SearchWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

interface ErrorMessageSearchProps {
  label: string;
  placeholder: string;
  handleChange: (input: string) => void;
  debounceTime?: number;
}

export const DebouncedSearch: FunctionComponent<ErrorMessageSearchProps> = ({
  label,
  placeholder,
  handleChange,
  debounceTime = 500,
}: PropsWithChildren<ErrorMessageSearchProps>) => {
  const [search, setSearch] = useState('');
  const debouncedValue = useDebounce(search, debounceTime);

  useEffect(() => {
    handleChange(debouncedValue);
  }, [debouncedValue, handleChange]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <Input
      id="error-message-search"
      name="error-message-search"
      type="search"
      placeholder={placeholder}
      icon="Search"
      iconPlacement="right"
      onChange={onChange}
      aria-label={label}
      fullWidth
    />
  );
};
