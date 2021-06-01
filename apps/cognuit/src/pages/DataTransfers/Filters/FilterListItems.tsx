import React from 'react';
import { Menu } from '@cognite/cogs.js';
import uniqueId from 'lodash/uniqueId';
import isObject from 'lodash/isObject';
import { GenericResponseObject } from 'typings/interfaces';

import { FilterListFiltersSource } from './types';

type SourceType = {
  name?: string;
  id?: string;
  // eslint-disable-next-line camelcase
  external_id?: string;
};

export const FilterListItems = (
  filterList: FilterListFiltersSource,
  onSelect: (source: SourceType) => void,
  closeHandler: () => void,
  onReset?: () => void,
  resetText: string = 'Reset'
) => (
  <Menu>
    {onReset && (
      <>
        <Menu.Item
          key="Reset"
          onClick={() => {
            onReset();
            closeHandler();
          }}
        >
          {resetText}
        </Menu.Item>
        <Menu.Divider />
      </>
    )}
    {(filterList as GenericResponseObject[]).map((source: SourceType) => (
      <Menu.Item
        key={uniqueId()}
        onClick={() => {
          onSelect(source);
          closeHandler();
        }}
      >
        {isObject(source)
          ? // eslint-disable-next-line camelcase
            source.name || source.external_id || source.id
          : source}
      </Menu.Item>
    ))}
  </Menu>
);
