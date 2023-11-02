import * as React from 'react';
import { useMemo, useState } from 'react';

import { Field } from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';

import {
  EmptyState,
  ErrorState,
  LoadingState,
  Menu,
  MenuHeader,
  MenuItem,
  MenuList,
  SearchInput,
} from '../../components';

import { getFilteredFields, getMenuItemIcon } from './utils';

export interface FieldSelectorProps<T = unknown> {
  title: string;
  subtitle?: string;
  fields: Field<T>[];
  onBackClick?: () => void;
  onSelectField: (field: Field<T>) => void;
  onSearchInputChange?: (value: string) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export const FieldSelector = <T,>({
  title,
  subtitle,
  fields,
  onBackClick,
  onSelectField,
  onSearchInputChange,
  isLoading,
  isError,
}: FieldSelectorProps<T>) => {
  const [searchInputValue, setSearchInputValue] = useState<string>('');

  const filteredFields = useMemo(() => {
    return getFilteredFields(fields, searchInputValue);
  }, [fields, searchInputValue]);

  const handleSearchInputChange = (value: string) => {
    setSearchInputValue(value);
    onSearchInputChange?.(value);
  };

  if (isError) {
    return (
      <Menu>
        <ErrorState />
      </Menu>
    );
  }

  const renderMenuContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (isError) {
      return <ErrorState />;
    }

    if (isEmpty(filteredFields)) {
      return <EmptyState />;
    }

    return (
      <MenuList>
        {filteredFields.map((field) => {
          return (
            <MenuItem
              key={field.id}
              title={field.displayName || field.id}
              icon={getMenuItemIcon(field.type)}
              onClick={() => onSelectField(field)}
            />
          );
        })}
      </MenuList>
    );
  };

  return (
    <Menu>
      <MenuHeader title={title} subtitle={subtitle} onBackClick={onBackClick} />

      <SearchInput
        value={searchInputValue}
        onChange={handleSearchInputChange}
      />

      {renderMenuContent()}
    </Menu>
  );
};
