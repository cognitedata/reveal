import { Icon, IconType } from '@cognite/cogs.js';
import { PAGES } from 'pages/routers/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { NavigateBack } from 'components/NavigateBack/NavigateBack';

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
  const iconDisplay =
    icon === 'ArrowLeft' ? (
      <NavigateBack>
        <Icon type={icon} />
      </NavigateBack>
    ) : (
      <Icon type={icon} />
    );
  return (
    <SearchInputWrapper>
      {iconDisplay}
      <SearchInput
        value={query}
        onChange={handleChange}
        autoFocus={autoFocus}
        placeholder={placeholder}
      />
    </SearchInputWrapper>
  );
};
