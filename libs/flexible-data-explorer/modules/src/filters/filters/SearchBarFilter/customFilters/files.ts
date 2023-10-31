import { DataTypeOption, Operator } from '@fdx/shared/types/filters';

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
      id: 'Asset',
      type: 'number',
      operators: [
        Operator.CONTAINS,
        Operator.NOT_CONTAINS,
        ...EXISTANCE_OPERATORS,
      ],
    },
    { id: 'External ID', type: 'string' },
    {
      id: 'Internal ID',
      type: 'number',
      operators: [
        Operator.CONTAINS,
        Operator.NOT_CONTAINS,
        Operator.EQUALS,
        ...EXISTANCE_OPERATORS,
      ],
    },
    {
      id: 'Label',
      type: 'string',
      operators: [...EXISTANCE_OPERATORS],
    },
    {
      id: 'Type',
      type: 'string',
      operators: [Operator.EQUALS, Operator.NOT_EQUALS, ...EXISTANCE_OPERATORS],
    },
    { id: 'Author', type: 'string' },
    { id: 'Source', type: 'string' },
    { id: 'Created Time', type: 'date' },
    { id: 'Updated Time', type: 'date' },
  ],
};
