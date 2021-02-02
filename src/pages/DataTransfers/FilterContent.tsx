import React from 'react';
import 'antd/es/date-picker/style/index';
import dateFnsGenerateConfig from 'rc-picker/lib/generate/dateFns';
import generatePicker from 'antd/es/date-picker/generatePicker';
import { Button, IconType, Menu } from '@cognite/cogs.js';
import uniqueId from 'lodash/uniqueId';
import isObject from 'lodash/isObject';
import { DataTransferObject, GenericResponseObject } from 'typings/interfaces';

import { CalendarWrapper } from './elements';
import { FilterDateType, FilterTypes } from './types';

const DatePicker = generatePicker<Date>(dateFnsGenerateConfig);
const { RangePicker } = DatePicker;

type FilterType = {
  icon?: IconType;
  name?: string;
  id?: string;
  external_id?: string;
};

type FiltersType = {
  name: keyof FilterTypes;
  source: object[];
  onSelect: (
    filter: string | DataTransferObject | GenericResponseObject | null
  ) => void;
};

const filterElements: FilterTypes = {
  source: null,
  target: null,
  sourceProject: null,
  targetProject: null,
  dataTypes: null,
  config: null,
  date: null,
};

export const getFilters = (
  source: any,
  target: any,
  datatype: any,
  configuration: any,
  setOpenFilter: any
) => {
  const filters: FiltersType[] = [
    {
      name: 'source',
      source: source.sources,
      onSelect: source.onSelectSource,
    },
    {
      name: 'target',
      source: target.targets,
      onSelect: target.onSelectTarget,
    },
    {
      name: 'sourceProject',
      source: source.projects,
      onSelect: source.onSelectProject,
    },
    {
      name: 'targetProject',
      source: target.projects,
      onSelect: target.onSelectProject,
    },
    {
      name: 'dataTypes',
      source: datatype.types,
      onSelect: datatype.onSelectType,
    },
    {
      name: 'config',
      source: configuration.configurations,
      onSelect: configuration.onSelectConfiguration,
    },
  ];

  const getFilter = (filterList: FiltersType) => (
    <Menu>
      {filterList.source.map((filter: FilterType | string) => (
        <Menu.Item
          key={uniqueId()}
          onClick={() => {
            console.log(filter);
            filterList.onSelect(filter);
            setOpenFilter('');
          }}
          appendIcon={isObject(filter) ? filter.icon : 'Right'}
        >
          {isObject(filter)
            ? filter.name || filter.external_id || filter.id
            : filter}
        </Menu.Item>
      ))}
    </Menu>
  );

  filters.forEach((filterList) => {
    filterElements[filterList.name] = getFilter(filterList);
  });

  return filterElements;
};

export const getDateFilter = (
  date: FilterDateType,
  setOpen: (openFilter: keyof FilterTypes | '') => void,
  open: boolean
) => (
  <CalendarWrapper>
    <RangePicker
      onChange={(selected) => {
        date.onSelectDate(selected);
        setOpen('');
      }}
      value={date.selectedRange}
      open={open}
      popupStyle={{ backgroundColor: 'white', paddingTop: '52px' }}
    />
    <Button
      className="close-button"
      icon="Close"
      iconPlacement="right"
      size="small"
      variant="outline"
      aria-label="Close"
      onClick={() => setOpen('date')}
    >
      Close
    </Button>
  </CalendarWrapper>
);
