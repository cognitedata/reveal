import * as React from 'react';
import { useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import {
  EmptyState,
  ErrorState,
  Menu,
  MenuItem,
  MenuList,
  SearchInput,
} from '../../components';
import { DataType } from '../../types';

import { getFilteredDataTypes } from './utils';

export interface DataTypeSelectorProps<T extends DataType> {
  dataTypes: T[];
  onSelectDataType: (dataType: T) => void;
  isError?: boolean;
}

export const DataTypeSelector = <T extends DataType>({
  dataTypes,
  onSelectDataType,
  isError,
}: DataTypeSelectorProps<T>) => {
  const [searchInputValue, setSearchInputValue] = useState<string>('');

  const filteredDataTypes = useMemo(() => {
    return getFilteredDataTypes(dataTypes, searchInputValue);
  }, [dataTypes, searchInputValue]);

  if (isError) {
    return (
      <Menu>
        <ErrorState />
      </Menu>
    );
  }

  return (
    <Menu>
      <SearchInput value={searchInputValue} onChange={setSearchInputValue} />

      {isEmpty(filteredDataTypes) ? (
        <EmptyState />
      ) : (
        <MenuList>
          {filteredDataTypes.map((dataType) => {
            return (
              <MenuItem
                key={dataType.name}
                title={dataType.displayName || dataType.name}
                subtitle={dataType.description}
                onClick={() => onSelectDataType(dataType)}
              />
            );
          })}
        </MenuList>
      )}
    </Menu>
  );
};
