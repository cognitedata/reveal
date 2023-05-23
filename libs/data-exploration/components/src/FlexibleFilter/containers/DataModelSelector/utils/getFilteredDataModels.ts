import isEmpty from 'lodash/isEmpty';

import { DataModel } from '../../../types';

export const getFilteredDataModels = (
  dataModels: DataModel[],
  searchInputValue: string
): DataModel[] => {
  const search = searchInputValue.trim().toLowerCase();

  if (isEmpty(search)) {
    return dataModels;
  }

  return dataModels.filter(({ name, description }) => {
    return (
      name.toLowerCase().includes(search) ||
      description?.toLowerCase().includes(search)
    );
  });
};
