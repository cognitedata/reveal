export interface KeyValueMap {
  [key: string]: string | number | unknown;
}

export enum ColumnDataType {
  Text = 'TEXT',
  Number = 'NUMBER',
  Decimal = 'DECIMAL',
  Date = 'DATE',
  Time = 'TIME',
  DateTime = 'DATE_TIME',
  Currency = 'CURRENCY',
  Percentage = 'PERCENTAGE',
  Duration = 'DURATION',
  Boolean = 'BOOLEAN',
  Dynamic = 'DYNAMIC',
}

export enum ColumnRuleType {
  MATCHING_RULE = 'MATCHING_RULE',
  VALIDATION_RULE = 'VALIDATION_RULE',
  CALCULATION_RULE = 'CALCULATION_RULE',
  VISIBILITY_RULE = 'VISIBILITY_RULE',
  FORMATTING_RULE = 'FORMATTING_RULE',
  EDIT_RULE = 'EDIT_RULE',
  COLUMN_GROUPING_RULE = 'COLUMN_GROUPING_RULE',
  ROW_GROUPING_RULE = 'ROW_GROUPING_RULE',
  LABEL_FORMATTING_RULE = 'LABEL_FORMATTING_RULE',
}

export enum ColumnValueType {
  Value = 'value',
  Expression = 'expression',
}

export enum DataSourceType {
  LIST = 'LIST',
  OBJECT_LIST = 'OBJECT_LIST',
  LOOKUP = 'LOOKUP',
}

export interface ColumnConfig {
  property: string;
  label: string;
  optional: boolean;
  data_type: ColumnDataType | string;
  default_value: unknown;
  exec_order: number;
  attribute_metadata: KeyValueMap;
  attribute_rules: KeyValueMap[];
  display_order: number;
}

export interface GridConfig {
  columns: ColumnConfig[];
  custom_functions: any[];
  data_sources: any[];
}
