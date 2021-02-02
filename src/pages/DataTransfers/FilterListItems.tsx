import React from 'react';
import { Menu } from '@cognite/cogs.js';
import uniqueId from 'lodash/uniqueId';
import isObject from 'lodash/isObject';

import { FilterListFiltersSource } from './types';

type SourceType = {
  name?: string;
  id?: string;
  external_id?: string;
};

export const FilterListItems = (
  filterList: FilterListFiltersSource,
  onSelect: (source: SourceType) => void,
  closeHandler: () => void
) => (
  <Menu>
    {(filterList as any[]).map((source: SourceType) => (
      <Menu.Item
        key={uniqueId()}
        onClick={() => {
          console.log(source);
          onSelect(source);
          closeHandler();
        }}
      >
        {isObject(source)
          ? source.name || source.external_id || source.id
          : source}
      </Menu.Item>
    ))}
  </Menu>
);
