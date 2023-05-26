import { DataModelTypeDefsType } from '@platypus/platypus-core';

import { Option } from '../types';

import { transformDefFieldsToFilterFields } from './transformDefFieldsToFilterFields';

export const transformDefTypesToFilterOptions = (
  data: DataModelTypeDefsType[]
): Option[] => {
  return data.map(({ name, description, fields }) => {
    return {
      name,
      description,
      fields: transformDefFieldsToFilterFields(fields),
    };
  });
};
