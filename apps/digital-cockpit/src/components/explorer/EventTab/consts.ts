import { SearchFilterSelector } from 'components/search/types';

export const EVENT_FILTER_SELECTORS: SearchFilterSelector[] = [
  {
    name: 'Min Start Time',
    type: 'DATE',
    field: ['startTime', 'min'],
  },
  {
    name: 'Max Start Time',
    type: 'DATE',
    field: ['startTime', 'max'],
  },
  {
    name: 'Min End Time',
    type: 'DATE',
    field: ['endTime', 'min'],
  },
  {
    name: 'Max End Time',
    type: 'DATE',
    field: ['endTime', 'max'],
  },
  {
    name: 'Min Active at time',
    type: 'DATE',
    field: ['activeAtTime', 'min'],
  },
  {
    name: 'Max Active at',
    type: 'DATE',
    field: ['activeAtTime', 'max'],
  },
  { name: 'Type', type: 'STRING', field: ['type'] },
  { name: 'Sub Type', type: 'STRING', field: ['subtype'] },
  { name: 'Source', type: 'STRING', field: ['source'] },
  {
    name: 'External ID prefix',
    type: 'STRING',
    field: ['externalIdPrefix'],
  },
];
