import { DataModelTypeDefs } from '@platypus/platypus-core';

export const extractFieldsFromSchema = (
  schema: DataModelTypeDefs | undefined,
  selectedDataType: string
) => {
  const dataType = schema?.types.find((item) => item.name === selectedDataType);
  return dataType?.fields;
};
