import { Menu } from '@cognite/cogs.js';
import uniqueId from 'lodash/uniqueId';
import isObject from 'lodash/isObject';
import { ConfigurationsResponse, ProjectsResponse } from 'types/ApiInterface';

import { FilterListFiltersSource } from './types';

export const FilterListItems = (
  filterList: FilterListFiltersSource,
  onSelect: (source: FilterListFiltersSource[number]) => void,
  closeHandler: () => void,
  onReset?: () => void,
  resetText = 'Reset'
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
    {filterList.map((source) => (
      <Menu.Item
        key={uniqueId()}
        onClick={() => {
          onSelect(source);
          closeHandler();
        }}
      >
        {isObject(source)
          ? // eslint-disable-next-line camelcase
            (source as ConfigurationsResponse).name ||
            (source as ProjectsResponse).external_id ||
            source.id
          : source}
      </Menu.Item>
    ))}
  </Menu>
);
