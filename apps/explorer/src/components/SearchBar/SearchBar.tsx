import { Icon, IconType } from '@cognite/cogs.js';
import React from 'react';

import { SearchInput, SearchInputWrapper } from './elements';

interface Props {
  autoFocus?: boolean;
  icon?: IconType;
  placeholder: string;
  query: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClose?: () => void;
}

export const SearchBar: React.FC<Props> = ({
  autoFocus,
  icon = 'Search',
  placeholder,
  query,
  handleChange,
  handleClose,
}) => {
  const iconDisplay =
    icon === 'ArrowLeft' ? (
      <Icon style={{ cursor: 'pointer' }} onClick={handleClose} type={icon} />
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
