import { Field } from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';

export const getFilteredFields = (
  fields: Field[],
  searchInputValue: string
): Field[] => {
  const search = searchInputValue.trim().toLowerCase();

  if (isEmpty(search)) {
    return fields;
  }

  return fields.filter(({ name }) => {
    return name.toLowerCase().includes(search);
  });
};
