import { customDataTypeOptions } from '../customFilters';

export const getCustomDataTypeOption = (dataType: string) => {
  return customDataTypeOptions.find((option) => option.name === dataType);
};
