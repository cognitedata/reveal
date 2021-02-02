import React from 'react';
import { IconType, Menu } from '@cognite/cogs.js';
import uniqueId from 'lodash/uniqueId';
import isObject from 'lodash/isObject';

import { FilterListFiltersSource } from './types';

type SourceType = {
  icon?: IconType;
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
    {(filterList as any[]).map((source: SourceType) => {
      const icon = isObject(source) ? source.icon : 'Right';
      const label = isObject(source)
        ? source.name || source.external_id || source.id
        : source;

      const onClick = () => {
        console.log(source);
        onSelect(source);
        closeHandler();
      };

      return (
        <Menu.Item key={uniqueId()} onClick={onClick} appendIcon={icon}>
          {label}
        </Menu.Item>
      );
    })}
  </Menu>
);
