import { DataModelTypeDefsFieldType } from '@platypus/platypus-core';

import { FieldType } from '../types';

export const getFieldType = ({
  name,
}: DataModelTypeDefsFieldType): FieldType | 'unknown' => {
  switch (name) {
    case 'String':
      return 'string';

    case 'Int':
    case 'Int32':
    case 'Int64':
    case 'Float':
    case 'Float32':
    case 'Float64':
      return 'number';

    case 'Boolean':
      return 'boolean';

    case 'Timestamp': {
      return 'date';
    }

    default:
      return 'unknown';
  }
};
