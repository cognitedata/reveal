import compact from 'lodash/compact';

import { DataModelTypeDefsField } from '../../../../../services/types';
import { Field } from '../../../types';

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
        name,
        displayName,
        type: fieldType,
      };
    })
  );
};
