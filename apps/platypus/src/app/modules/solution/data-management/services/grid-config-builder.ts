/* eslint-disable no-prototype-builtins */
import {
  ColumnConfig,
  ColumnDataType,
  GridConfig,
} from '@cognite/cog-data-grid';
import {
  DataModelTypeDefsField,
  DataModelTypeDefsType,
  KeyValueMap,
} from '@platypus/platypus-core';
import { IFilterDef } from 'ag-grid-community';
import { CustomColumnFilter } from '../components/CustomColumnFilter/custom-column-filter';
import { CheckboxCellRenderer } from '../components/DataPreviewTable/cell-renderers/CheckboxCellRenderer';
import { CustomCellRenderer } from '../components/DataPreviewTable/cell-renderers/CustomCellRenderer';
import { IdCellRenderer } from '../components/DataPreviewTable/cell-renderers/IdCellRenderer';

import { COL_TYPES_MAP, INSTANCE_TYPE_DEFS_FIELD } from '../utils/constants';

const colFiltersMap: KeyValueMap = {
  String: 'agTextColumnFilter',
  Int: 'agNumberColumnFilter',
  Float: 'agNumberColumnFilter',
  Int64: 'agNumberColumnFilter',
  Timestamp: 'agDateColumnFilter',
  Id: 'agTextColumnFilter',
};

export const getInitialGridConfig = () => {
  return {
    columns: [],
    customFunctions: [],
    dataSources: [],
  } as GridConfig;
};

export const getColFilter = (field: DataModelTypeDefsField) => {
  const isList = field.type.list || false;
  let filter: IFilterDef['filter'] = false;

  if (isList && !field.type.custom) {
    return 'agTextColumnFilter';
  }

  if (field.type.custom && !isList) {
    return CustomColumnFilter;
  }

  if (!field.type.custom && !isList) {
    filter = colFiltersMap.hasOwnProperty(field.type.name)
      ? colFiltersMap[field.type.name]
      : true;
  }

  return filter;
};
export const buildGridConfig = (
  instanceIdCol: string,
  dataModelType: DataModelTypeDefsType,
  onRowAdd: (row: KeyValueMap) => void,
  isDeletionEnabled: boolean,
  isManualPopulationEnabled: boolean
): GridConfig => {
  const columns: ColumnConfig[] = isDeletionEnabled
    ? [
        {
          label: '',
          property: '_isDraftSelected',
          defaultValue: '',
          dataType: ColumnDataType.Text,
          colDef: {
            editable: false,
            sortable: false,
            suppressMovable: true,
            cellRenderer: CheckboxCellRenderer,
            headerComponent: () => '',
            width: 44,
          },
        },
      ]
    : [];

  columns.push(
    {
      label: 'Instances',
      property: instanceIdCol,
      defaultValue: '',
      dataType: ColumnDataType.Id,
      colDef: {
        editable: false,
        sortable: false,
        suppressMovable: true,
        cellRenderer: IdCellRenderer,
        filter: getColFilter(INSTANCE_TYPE_DEFS_FIELD),
        cellRendererParams: {
          onRowAdd,
        },
        cellStyle: {
          padding: '0 var(--ag-cell-horizontal-padding)',
        },
      },
    },
    ...dataModelType.fields.map((field) => {
      const isList = field.type.list || false;
      const dataType = COL_TYPES_MAP.hasOwnProperty(field.type.name)
        ? COL_TYPES_MAP[field.type.name]
        : ColumnDataType.Custom;

      const colConfig = {
        label: field.name,
        property: field.name,
        dataType,
        optional: field.nonNull,
        defaultValue: '',
        rules: [],
        metadata: {},
        isList,
        colDef: {
          headerName: `${field.name}${field.type.nonNull ? '*' : ''}`,
          // Mixer API supports sorting only on primitives (not array and not custom types)
          sortable: !field.type.custom && !isList,
          filter: getColFilter(field),
          editable:
            isManualPopulationEnabled &&
            !isList &&
            dataType !== ColumnDataType.Json,
          cellEditorParams: {
            isRequired: field.nonNull || field.type.nonNull,
          },
          ...(!COL_TYPES_MAP.hasOwnProperty(field.type.name) &&
            !isList && {
              cellRenderer: CustomCellRenderer,
            }),
        },
      } as ColumnConfig;

      return colConfig;
    })
  );

  return { ...getInitialGridConfig(), columns: columns };
};
