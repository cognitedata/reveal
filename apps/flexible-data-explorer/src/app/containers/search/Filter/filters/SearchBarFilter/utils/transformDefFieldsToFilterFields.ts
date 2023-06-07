import { DataModelTypeDefsField } from '@platypus/platypus-core';
import compact from 'lodash/compact';

import { Field } from '../../../types';

import { getFieldType } from './getFieldType';

export const transformDefFieldsToFilterFields = (
  fields: DataModelTypeDefsField[]
): Field[] => {
  return compact(
    fields.map(({ name, type }) => {
      const fieldType = getFieldType(type);

      if (fieldType === 'unknown') {
        return null;
      }

      return {
        name,
        type: fieldType,
      };
    })
  );
};
