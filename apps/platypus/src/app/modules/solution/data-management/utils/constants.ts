import { ColumnDataType } from '@cognite/cog-data-grid';
import { DataModelTypeDefsField, KeyValueMap } from '@platypus/platypus-core';

export const INSTANCE_TYPE_DEFS_FIELD: DataModelTypeDefsField = {
  name: 'externalId',
  type: {
    name: 'externalId',
    custom: false,
    list: false,
  },
};

export const COL_TYPES_MAP: KeyValueMap = {
  Boolean: ColumnDataType.Boolean,
  Float: ColumnDataType.Decimal,
  Int: ColumnDataType.Number,
  Int64: ColumnDataType.Number,
  JSONObject: ColumnDataType.Json,
  String: ColumnDataType.Text,
  Timestamp: ColumnDataType.DateTime,
};

export const FILTER_OPTIONS_WITHOUT_INPUT = ['Is empty', 'Is not empty'];
export const FILTER_OPTIONS_WITH_RANGE_INPUT = ['inRange'];
