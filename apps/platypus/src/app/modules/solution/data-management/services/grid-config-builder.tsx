/* eslint-disable no-prototype-builtins */
import { ContextualizationScoreHeader } from '@fusion/contextualization';
import {
  DataModelTypeDefsField,
  DataModelTypeDefsType,
  DataModelVersion,
  KeyValueMap,
} from '@platypus/platypus-core';
import { IFilterDef } from 'ag-grid-community';

import {
  ColumnConfig,
  ColumnDataType,
  GridConfig,
} from '@cognite/cog-data-grid';
import { IconType } from '@cognite/cogs.js';

import { CustomColumnFilter } from '../components/CustomColumnFilter/custom-column-filter';
import { CheckboxCellRenderer } from '../components/DataPreviewTable/cell-renderers/CheckboxCellRenderer';
import { CustomCellRenderer } from '../components/DataPreviewTable/cell-renderers/CustomCellRenderer';
import { IdCellRenderer } from '../components/DataPreviewTable/cell-renderers/IdCellRenderer';
import { COL_TYPES_MAP, INSTANCE_TYPE_DEFS_FIELDS } from '../utils/constants';

const colFiltersMap: KeyValueMap = {
  String: 'agTextColumnFilter',
  Int: 'agNumberColumnFilter',
  Float: 'agNumberColumnFilter',
  Int64: 'agNumberColumnFilter',
  Int32: 'agNumberColumnFilter',
  Float32: 'agNumberColumnFilter',
  Float64: 'agNumberColumnFilter',
  Timestamp: 'agDateColumnFilter',
  Date: 'agDateColumnFilter',
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
  isManualPopulationEnabled: boolean,
  columnOrder: string[],
  nativeFilter: boolean,
  dataModelVersions: DataModelVersion[]
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
    ...[...INSTANCE_TYPE_DEFS_FIELDS, ...dataModelType.fields]
      .filter((el) => columnOrder.includes(el.name))
      .sort((a, b) => {
        const aIndex = columnOrder.indexOf(a.name);
        const bIndex = columnOrder.indexOf(b.name);
        return aIndex - bIndex;
      })
      .map((field) => {
        const builtInDataField = INSTANCE_TYPE_DEFS_FIELDS.find(
          (el) => el.name === field.name
        );
        if (field.name === instanceIdCol && builtInDataField) {
          return {
            label: instanceIdCol,
            property: instanceIdCol,
            defaultValue: '',
            dataType: ColumnDataType.Id,
            colDef: {
              editable: (row) =>
                row.data._draftStatus ? isManualPopulationEnabled : false,
              sortable: false,
              suppressMovable: true,
              cellRenderer: IdCellRenderer,
              filter: nativeFilter ? getColFilter(builtInDataField) : false,
              cellRendererParams: {
                onRowAdd,
              },
              cellEditorParams: {
                onRowAdd,
              },
            },
          } as ColumnConfig;
        }
        const isList = field.type.list || false;
        const dataType = COL_TYPES_MAP.hasOwnProperty(field.type.name)
          ? COL_TYPES_MAP[field.type.name]
          : ColumnDataType.Custom;
        let customIcon: IconType | undefined = undefined;
        if (
          field.type.name === 'TimeSeries' ||
          field.type.name === 'Sequence'
        ) {
          customIcon = 'Timeseries';
        }
        if (field.type.name === 'File') {
          customIcon = 'Document';
        }

        const colConfig = {
          label: field.name,
          property: field.name,
          dataType,
          optional: field.type.nonNull,
          defaultValue: '',
          rules: [],
          metadata: {},
          isList,
          colDef: {
            headerName: `${field.name}${field.type.nonNull ? '*' : ''}`,
            headerComponentParams: {
              headerIcon: customIcon,
              extras: field.type.custom ? (
                <ContextualizationScoreHeader
                  dataModelVersions={dataModelVersions}
                  field={field}
                />
              ) : null,
            },
            suppressMovable: true,
            // Mixer API supports sorting only on primitives (not array and not custom types)
            sortable: !field.type.custom && !isList && !builtInDataField,
            filter:
              !nativeFilter || builtInDataField ? false : getColFilter(field),
            editable: isManualPopulationEnabled && !isList && !builtInDataField,
            cellEditorParams: {
              isRequired: field.type.nonNull,
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
