import { Icon, IconType } from '@cognite/cogs.js';
import { PAGES } from 'pages/routers/constants';
import React from 'react';
import { Link } from 'react-router-dom';

import { SearchInput, SearchInputWrapper, SearchButton } from './elements';

interface Props {
  autoFocus?: boolean;
  icon?: IconType;
  placeholder: string;
  query: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NavigateToSearchButton: React.FC = () => {
  return (
    <Link to={PAGES.SEARCH}>
      <SearchButton icon="Search">What are you looking for?</SearchButton>
    </Link>
  );
};

export const SearchBar: React.FC<Props> = ({
  autoFocus,
  icon = 'Search',
  placeholder,
  query,
  handleChange,
}) => {
  return (
    <SearchInputWrapper>
      <Icon type={icon} />
      <SearchInput
        value={query}
        onChange={handleChange}
        autoFocus={autoFocus}
        placeholder={placeholder}
      />
    </SearchInputWrapper>
  );
};
