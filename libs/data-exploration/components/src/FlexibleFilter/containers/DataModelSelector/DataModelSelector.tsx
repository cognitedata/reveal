import * as React from 'react';
import { useMemo, useState } from 'react';

import { Menu, MenuItem, SearchInput } from '../../components';
import { DataModel } from '../../types';
import { getFilteredDataModels } from './utils';

export interface DataModelSelectorProps {
  dataModels: DataModel[];
  onSelectDataModel: (dataModel: DataModel) => void;
}

export const DataModelSelector: React.FC<DataModelSelectorProps> = ({
  dataModels,
  onSelectDataModel,
}) => {
  const [searchInputValue, setSearchInputValue] = useState<string>('');

  const filteredDataModels = useMemo(() => {
    return getFilteredDataModels(dataModels, searchInputValue);
  }, [dataModels, searchInputValue]);

  return (
    <Menu>
      <SearchInput value={searchInputValue} onChange={setSearchInputValue} />

      <div>
        {filteredDataModels.map((dataModel) => {
          return (
            <MenuItem
              key={dataModel.name}
              title={dataModel.name}
              subtitle={dataModel.description}
              onClick={() => onSelectDataModel(dataModel)}
            />
          );
        })}
      </div>
    </Menu>
  );
};
