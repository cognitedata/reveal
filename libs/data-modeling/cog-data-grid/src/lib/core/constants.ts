import { KeyValueMap, ColumnDataType } from './types';

export const COL_TYPES_MAP: KeyValueMap = {
  Boolean: ColumnDataType.Boolean,
  String: ColumnDataType.Text,
  Int: ColumnDataType.Number,
  Int64: ColumnDataType.Number,
  Float: ColumnDataType.Decimal,
  Timestamp: ColumnDataType.DateTime,
};
