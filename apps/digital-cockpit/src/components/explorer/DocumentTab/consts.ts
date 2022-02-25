import { SearchFilterSelector } from 'components/search/types';

export const FILE_FILTER_SELECTORS: SearchFilterSelector[] = [
  { name: 'File Type', type: 'STRING', field: ['mimeType'] },
  { name: 'Source', type: 'STRING', field: ['source'] },
  { name: 'Min Created Time', type: 'DATE', field: ['createdTime', 'min'] },
  { name: 'Max Created Time', type: 'DATE', field: ['createdTime', 'max'] },
  {
    name: 'Min Last Updated Time',
    type: 'DATE',
    field: ['lastUpdatedTime', 'min'],
  },
  {
    name: 'Max Last Updated Time',
    type: 'DATE',
    field: ['lastUpdatedTime', 'max'],
  },
  {
    name: 'Min Uploaded Time',
    type: 'DATE',
    field: ['uploadedTime', 'min'],
  },
  {
    name: 'Max Uploaded Time',
    type: 'DATE',
    field: ['uploadedTime', 'max'],
  },
  {
    name: 'Min Source Created Time',
    type: 'DATE',
    field: ['sourceCreatedTime', 'min'],
  },
  {
    name: 'Max Source Created Time',
    type: 'DATE',
    field: ['sourceCreatedTime', 'max'],
  },
  {
    name: 'Min Source Modified Time',
    type: 'DATE',
    field: ['sourceModifiedTime', 'min'],
  },
  {
    name: 'Max Source Modified Time',
    type: 'DATE',
    field: ['sourceModifiedTime', 'max'],
  },
  {
    name: 'External ID prefix',
    type: 'STRING',
    field: ['externalIdPrefix'],
  },
  {
    name: 'Uploaded',
    type: 'BOOLEAN',
    field: ['uploaded'],
  },
];
