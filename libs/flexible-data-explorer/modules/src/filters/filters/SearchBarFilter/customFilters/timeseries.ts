import { DataTypeOption, Operator } from '@fdx/shared/types/filters';

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
      id: 'Asset',
      type: 'string',
      operators: [Operator.STARTS_WITH],
    },
    {
      id: 'External ID',
      type: 'string',
      operators: [Operator.STARTS_WITH],
    },
    // {
    //   name: 'Internal ID',
    //   type: 'number',
    //   operators: [Operator.EQUALS],
    // },
    {
      id: 'Is Step',
      type: 'boolean',
      operators: [Operator.IS_TRUE, Operator.IS_FALSE],
    },
    {
      id: 'Is String',
      type: 'boolean',
      operators: [Operator.IS_TRUE, Operator.IS_FALSE],
    },
    {
      id: 'Created Time',
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
      id: 'Updated Time',
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
