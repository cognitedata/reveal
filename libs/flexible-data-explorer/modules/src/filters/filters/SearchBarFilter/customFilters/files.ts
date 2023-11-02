import { DataTypeOption, Operator } from '@fdx/shared/types/filters';

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
      operators: [Operator.EQUALS, Operator.IS_SET, Operator.IS_NOT_SET],
    },
    { id: 'External ID', type: 'string' },
    {
      id: 'Internal ID',
      type: 'number',
      operators: [Operator.EQUALS, Operator.IS_SET, Operator.IS_NOT_SET],
    },
    {
      id: 'Label',
      type: 'string',
      operators: [Operator.IS_SET, Operator.IS_NOT_SET],
    },
    {
      id: 'Type',
      type: 'string',
      operators: [
        Operator.EQUALS,
        Operator.NOT_EQUALS,
        Operator.IS_SET,
        Operator.IS_NOT_SET,
      ],
    },
    { id: 'Author', type: 'string' },
    { id: 'Source', type: 'string' },
    { id: 'Created Time', type: 'date' },
    { id: 'Updated Time', type: 'date' },
  ],
};
