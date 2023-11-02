import { Field, Operator } from '@fdx/shared/types/filters';

import { Timeseries } from '@cognite/sdk';

import { EXISTANCE_OPERATORS } from '../../constants';

export const TIMESERIES_FIELDS: Field<Timeseries>[] = [
  {
    id: 'name',
    displayName: 'Name',
    type: 'string',
  },
  {
    id: 'isString',
    displayName: 'Is string',
    type: 'boolean',
    exist: true,
  },
  {
    id: 'isStep',
    displayName: 'Is step',
    type: 'boolean',
    exist: true,
  },
  {
    id: 'unit',
    displayName: 'Unit',
    type: 'string',
    operators: [Operator.EQUALS, Operator.NOT_EQUALS, ...EXISTANCE_OPERATORS],
  },
  {
    id: 'assetId',
    displayName: 'Asset ID',
    type: 'number',
    operators: [Operator.EQUALS],
  },
  {
    id: 'createdTime',
    displayName: 'Created time',
    type: 'date',
    exist: true,
  },
  {
    id: 'lastUpdatedTime',
    displayName: 'Updated time',
    type: 'date',
    exist: true,
  },
];
