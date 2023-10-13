import { DataModelTypeDefsField } from '@platypus/platypus-core';

import { ColumnDataType } from '@cognite/cog-data-grid';

export const INSTANCE_TYPE_DEFS_FIELDS: DataModelTypeDefsField[] = [
  {
    name: 'externalId',
    type: { list: false, custom: false, name: 'String', nonNull: true },
  },
  {
    name: 'space',
    type: { list: false, custom: false, name: 'String', nonNull: true },
  },
  {
    name: 'lastUpdatedTime',
    type: { list: false, custom: false, name: 'Timestamp', nonNull: false },
  },
  {
    name: 'createdTime',
    type: { list: false, custom: false, name: 'Timestamp', nonNull: false },
  },
];

export const COL_TYPES_MAP: { [key: string]: string } = {
  Boolean: ColumnDataType.Boolean,
  Float: ColumnDataType.Decimal,
  Int: ColumnDataType.Number,
  Int32: ColumnDataType.Number,
  Int64: ColumnDataType.Number,
  Float32: ColumnDataType.Number,
  Float64: ColumnDataType.Number,
  JSONObject: ColumnDataType.Json,
  String: ColumnDataType.Text,
  Timestamp: ColumnDataType.DateTime,
  Date: ColumnDataType.Date,
};

export const FILTER_OPTIONS_WITHOUT_INPUT = ['Is empty', 'Is not empty'];
export const FILTER_OPTIONS_WITH_RANGE_INPUT = ['inRange'];
