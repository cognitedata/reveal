import isEmpty from 'lodash/isEmpty';

import { DataType } from '../../../types';

export const getFilteredDataTypes = (
  dataTypes: DataType[],
  searchInputValue: string
): DataType[] => {
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
