import { DataTypeOption, Operator } from '../../../types';

export const timeseries: DataTypeOption = {
  name: 'Timeseries',
  displayName: 'Time series',
  fields: [
    // {
    //   name: 'Data Set',
    //   type: 'string',
    //   operators: [Operator.STARTS_WITH],
    // },
    {
      name: 'Asset',
      type: 'string',
      operators: [Operator.STARTS_WITH],
    },
    {
      name: 'External ID',
      type: 'string',
      operators: [Operator.STARTS_WITH],
    },
    // {
    //   name: 'Internal ID',
    //   type: 'number',
    //   operators: [Operator.EQUALS],
    // },
    {
      name: 'Is Step',
      type: 'boolean',
      operators: [Operator.IS_TRUE, Operator.IS_FALSE],
    },
    {
      name: 'Is String',
      type: 'boolean',
      operators: [Operator.IS_TRUE, Operator.IS_FALSE],
    },
    {
      name: 'Created Time',
      type: 'date',
      operators: [
        Operator.BEFORE,
        Operator.NOT_BEFORE,
        Operator.BETWEEN,
        Operator.AFTER,
        Operator.NOT_AFTER,
      ],
    },
    {
      name: 'Updated Time',
      type: 'date',
      operators: [
        Operator.BEFORE,
        Operator.NOT_BEFORE,
        Operator.BETWEEN,
        Operator.AFTER,
        Operator.NOT_AFTER,
      ],
    },
  ],
};
