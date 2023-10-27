import { FieldType } from '@fdx/shared/types/filters';
import { DataModelTypeDefsFieldType } from '@fdx/shared/types/services';

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
