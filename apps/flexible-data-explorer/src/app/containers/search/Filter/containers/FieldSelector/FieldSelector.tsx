import * as React from 'react';
import { useMemo, useState } from 'react';

import { Menu, MenuHeader, MenuItem, SearchInput } from '../../components';
import { Field } from '../../types';

import { getFilteredFields, getMenuItemIcon } from './utils';

export interface FieldSelectorProps {
  name: string;
  fields: Field[];
  onBackClick: () => void;
  onSelectField: (field: Field) => void;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({
  name,
  fields,
  onBackClick,
  onSelectField,
}) => {
  const [searchInputValue, setSearchInputValue] = useState<string>('');

  const filteredFields = useMemo(() => {
    return getFilteredFields(fields, searchInputValue);
  }, [fields, searchInputValue]);

  return (
    <Menu>
      <MenuHeader title={name} onBackClick={onBackClick} />

      <SearchInput value={searchInputValue} onChange={setSearchInputValue} />

      <div>
        {filteredFields.map((field) => {
          return (
            <MenuItem
              key={field.name}
              title={field.name}
              icon={getMenuItemIcon(field.type)}
              onClick={() => onSelectField(field)}
            />
          );
        })}
      </div>
    </Menu>
  );
};
