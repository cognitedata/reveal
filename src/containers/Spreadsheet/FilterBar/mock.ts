import { FilterType } from 'components/FilterItem';

export const activeFilters: FilterType[] = [
  {
    type: 'columns',
    value: 13,
  },
  {
    type: 'number',
    value: 7,
    icon: 'GridLines', // TEMP
  },
  {
    type: 'string',
    value: 6,
    icon: 'TextTool', // TEMP
  },
  {
    type: 'boolean',
    value: 6,
    icon: 'CheckmarkFilled', // TEMP
  },
  {
    type: 'vector',
    value: 6,
    icon: 'ArrowDownRight', // TEMP
  },
  {
    type: 'object',
    value: 6,
    icon: 'Code', // TEMP
  },
  {
    type: 'date',
    value: 6,
    icon: 'Clock', // TEMP?
  },
];
