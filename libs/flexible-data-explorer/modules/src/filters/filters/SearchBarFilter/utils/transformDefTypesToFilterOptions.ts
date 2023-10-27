import { DataTypeOption } from '@fdx/shared/types/filters';
import { DataModelTypeDefsType } from '@fdx/shared/types/services';

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
