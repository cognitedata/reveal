import { DataModelTypeDefsType } from '../../../../../services/types';
import { DataTypeOption } from '../../../types';

import { transformDefFieldsToFilterFields } from './transformDefFieldsToFilterFields';

export const transformDefTypesToFilterOptions = (
  data: DataModelTypeDefsType[]
): DataTypeOption[] => {
  return data.map(({ name, description, fields, displayName }) => {
    return {
      name,
      displayName,
      description,
      fields: transformDefFieldsToFilterFields(fields),
    };
  });
};
