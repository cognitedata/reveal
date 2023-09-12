import { DataTypeOption, Operator } from '../../../types';

const EXISTANCE_OPERATORS = [Operator.IS_SET, Operator.IS_NOT_SET];

export const files: DataTypeOption = {
  name: 'Files',
  displayName: 'File',
  fields: [
    // {
    //   name: 'Data Set',
    //   type: 'number',
    //   operators: [
    //     Operator.CONTAINS,
    //     Operator.NOT_CONTAINS,
    //     Operator.EQUALS,
    //     Operator.NOT_EQUALS,
    //     ...EXISTANCE_OPERATORS,
    //   ],
    // },
    {
      name: 'Asset',
      type: 'number',
      operators: [
        Operator.CONTAINS,
        Operator.NOT_CONTAINS,
        ...EXISTANCE_OPERATORS,
      ],
    },
    { name: 'External ID', type: 'string' },
    {
      name: 'Internal ID',
      type: 'number',
      operators: [
        Operator.CONTAINS,
        Operator.NOT_CONTAINS,
        Operator.EQUALS,
        ...EXISTANCE_OPERATORS,
      ],
    },
    {
      name: 'Label',
      type: 'string',
      operators: [...EXISTANCE_OPERATORS],
    },
    {
      name: 'Type',
      type: 'string',
      operators: [Operator.EQUALS, Operator.NOT_EQUALS, ...EXISTANCE_OPERATORS],
    },
    { name: 'Author', type: 'string' },
    { name: 'Source', type: 'string' },
    { name: 'Created Time', type: 'date' },
    { name: 'Updated Time', type: 'date' },
  ],
};
