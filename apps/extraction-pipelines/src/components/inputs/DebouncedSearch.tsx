import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { Input } from '@cognite/cogs.js';
import { StyledLabel } from 'styles/StyledForm';
import { useDebounce } from 'hooks/useDebounce';
import styled from 'styled-components';

export const SearchWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

interface ErrorMessageSearchProps {
  label: string;
  handleChange: (input: string) => void;
  debounceTime?: number;
}

export const DebouncedSearch: FunctionComponent<ErrorMessageSearchProps> = ({
  label,
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
    <SearchWrapper>
      <StyledLabel htmlFor="error-message-search">{label}</StyledLabel>
      <Input
        id="error-message-search"
        name="error-message-search"
        type="search"
        icon="Search"
        iconPlacement="right"
        onChange={onChange}
      />
    </SearchWrapper>
  );
};
