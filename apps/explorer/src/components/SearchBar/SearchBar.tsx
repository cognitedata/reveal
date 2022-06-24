import { Icon, IconType } from '@cognite/cogs.js';
import React from 'react';
import { NavigateBack } from 'components/NavigateBack/NavigateBack';

import { SearchInput, SearchInputWrapper } from './elements';

interface Props {
  autoFocus?: boolean;
  icon?: IconType;
  placeholder: string;
  query: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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
