import { DataModelTypeDefsType } from '@platypus/platypus-core';

export const extractFieldsFromSchema = (
  types: DataModelTypeDefsType[] | undefined,
  selectedDataType: string
) => {
  const dataType = types?.find((item) => item.name === selectedDataType);
  return dataType?.fields;
};
