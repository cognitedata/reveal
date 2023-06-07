import isEmpty from 'lodash/isEmpty';

import { DataType } from '../../../types';

export const getFilteredDataTypes = <T extends DataType>(
  dataTypes: T[],
  searchInputValue: string
): T[] => {
  const search = searchInputValue.trim().toLowerCase();

  if (isEmpty(search)) {
    return dataTypes;
  }

  return dataTypes.filter(({ name, description }) => {
    return (
      name.toLowerCase().includes(search) ||
      description?.toLowerCase().includes(search)
    );
  });
};
