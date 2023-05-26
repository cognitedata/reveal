import * as React from 'react';
import { useMemo, useState } from 'react';

import { Menu, MenuItem, SearchInput } from '../../components';
import { DataType } from '../../types';

import { getFilteredDataTypes } from './utils';

export interface DataTypeSelectorProps {
  dataTypes: DataType[];
  onSelectDataType: (dataType: DataType) => void;
}

export const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({
  dataTypes,
  onSelectDataType,
}) => {
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
