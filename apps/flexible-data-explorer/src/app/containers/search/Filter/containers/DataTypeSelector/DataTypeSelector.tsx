import * as React from 'react';
import { useMemo, useState } from 'react';

import { Menu, MenuItem, SearchInput } from '../../components';
import { DataType } from '../../types';

import { getFilteredDataTypes } from './utils';

export interface DataTypeSelectorProps<T extends DataType> {
  dataTypes: T[];
  onSelectDataType: (dataType: T) => void;
}

export const DataTypeSelector = <T extends DataType>({
  dataTypes,
  onSelectDataType,
}: DataTypeSelectorProps<T>) => {
  const [searchInputValue, setSearchInputValue] = useState<string>('');

  const filteredDataTypes = useMemo(() => {
    return getFilteredDataTypes(dataTypes, searchInputValue);
  }, [dataTypes, searchInputValue]);

  return (
    <Menu>
      <SearchInput value={searchInputValue} onChange={setSearchInputValue} />

      <div>
        {filteredDataTypes.map((dataType) => {
          return (
            <MenuItem
              key={dataType.name}
              title={dataType.name}
              subtitle={dataType.description}
              onClick={() => onSelectDataType(dataType)}
            />
          );
        })}
      </div>
    </Menu>
  );
};
