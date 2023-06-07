import { KeyValueMap, ColumnDataType } from './types';

export const COL_TYPES_MAP: KeyValueMap = {
  Boolean: ColumnDataType.Boolean,
  String: ColumnDataType.Text,
  Int: ColumnDataType.Number,
  Int32: ColumnDataType.Number,
  Int64: ColumnDataType.Number,
  Float: ColumnDataType.Decimal,
  Float32: ColumnDataType.Decimal,
  Float64: ColumnDataType.Decimal,
  Timestamp: ColumnDataType.DateTime,
};
