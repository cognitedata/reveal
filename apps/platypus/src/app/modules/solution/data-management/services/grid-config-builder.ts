/* eslint-disable no-prototype-builtins */
import { ColumnConfig, GridConfig } from '@cognite/cog-data-grid';
import { KeyValueMap, DataModelTypeDefsType } from '@platypus/platypus-core';

const colTypesMap = {
  Boolean: 'BOOLEAN',
  String: 'TEXT',
  Int: 'NUMBER',
  Float: 'DECIMAL',
} as KeyValueMap;

export const getInitialGridConfig = () => {
  return {
    columns: [],
    customFunctions: [],
    dataSources: [],
  } as GridConfig;
};

export const buildGridConfig = (
  instanceIdCol: string,
  dataModelType: DataModelTypeDefsType
): GridConfig => {
  return {
    ...getInitialGridConfig(),
    columns: [
      {
        label: 'Instances',
        property: instanceIdCol,
        defaultValue: '',
        dataType: 'TEXT',
        colDef: {
          editable: false,
          sortable: false,
        },
      },
      ...dataModelType.fields.map((field) => {
        const colConfig = {
          label: field.name,
          property: field.name,
          dataType: colTypesMap.hasOwnProperty(field.type.name)
            ? colTypesMap[field.type.name]
            : 'CUSTOM',
          optional: field.nonNull,
          defaultValue: '',
          rules: [],
          metadata: {},
          colDef: {
            editable: false,
            sortable: false,
          },
        } as ColumnConfig;

        return colConfig;
      }),
    ],
  };
};
