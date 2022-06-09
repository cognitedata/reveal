import { Icon, IconType } from '@cognite/cogs.js';
import { PAGES } from 'pages/routers/constants';
import React from 'react';
import { Link } from 'react-router-dom';

import { SearchInput, SearchInputWrapper, SearchButton } from './elements';

interface Props {
  icon?: IconType;
  placeholder: string;
}

export const NavigateToSearchButton: React.FC = () => {
  return (
    <Link to={PAGES.SEARCH}>
      <SearchButton icon="Search">What are you looking for?</SearchButton>
    </Link>
  );
};

export const SearchBar: React.FC<Props> = ({
  icon = 'Search',
  placeholder,
}) => {
  return (
    <SearchInputWrapper>
      <Icon type={icon} />
      <SearchInput placeholder={placeholder} />
    </SearchInputWrapper>
  );
};
