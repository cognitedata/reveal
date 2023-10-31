import { Field } from '@fdx/shared/types/filters';
import { DataModelTypeDefsField } from '@fdx/shared/types/services';
import compact from 'lodash/compact';

import { getFieldType } from './getFieldType';

export const transformDefFieldsToFilterFields = (
  fields: DataModelTypeDefsField[]
): Field[] => {
  return compact(
    fields.map(({ name, displayName, type }) => {
      const fieldType = getFieldType(type);

      if (fieldType === 'unknown') {
        console.error(`Unknown field type ${type} for field ${name}`);
        return null;
      }

      return {
        id: name,
        displayName,
        type: fieldType,
      };
    })
  );
};
