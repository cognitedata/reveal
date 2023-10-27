import { DataType } from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';

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
