import { SearchFilterSelector } from 'components/search/types';

export const TIMESERIES_FILTER_SELECTORS: SearchFilterSelector[] = [
  { name: 'Name', type: 'STRING', field: ['name'] },
  { name: 'Unit', type: 'STRING', field: ['unit'] },
  {
    name: 'Is String Time Series',
    type: 'BOOLEAN',
    field: ['isString'],
  },
  {
    name: 'Is Step Time Series',
    type: 'BOOLEAN',
    field: ['isStep'],
  },
  {
    name: 'Min Last updated at',
    type: 'DATE',
    field: ['lastUpdatedTime', 'min'],
  },
  {
    name: 'Max Last updated at',
    type: 'DATE',
    field: ['lastUpdatedTime', 'max'],
  },
  {
    name: 'Min Created at',
    type: 'DATE',
    field: ['createdTime', 'min'],
  },
  {
    name: 'Max Created at',
    type: 'DATE',
    field: ['createdTime', 'max'],
  },
  {
    name: 'External ID prefix',
    type: 'STRING',
    field: ['externalIdPrefix'],
  },
];
