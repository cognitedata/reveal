import { Field } from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';

export const getFilteredFields = <T>(
  fields: Field<T>[],
  searchInputValue: string
): Field<T>[] => {
  const search = searchInputValue.trim().toLowerCase();

  if (isEmpty(search)) {
    return fields;
  }

  return fields.filter(({ id, displayName }) => {
    const name = displayName || id;
    return name.toLowerCase().includes(search);
  });
};
