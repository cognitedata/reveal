import { ColDef } from 'ag-grid-community';
import React from 'react';

export interface KeyValueMap {
  [key: string]: string | number | unknown;
}

export enum ColumnDataType {
  Boolean = 'BOOLEAN',
  Currency = 'CURRENCY',
  Custom = 'CUSTOM',
  Date = 'DATE',
  DateTime = 'DATE_TIME',
  Decimal = 'DECIMAL',
  Duration = 'DURATION',
  Dynamic = 'DYNAMIC',
  Id = 'ID',
  Json = 'JSON',
  Number = 'NUMBER',
  Percentage = 'PERCENTAGE',
  Text = 'TEXT',
  Time = 'TIME',
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
  label: React.ReactNode;
  optional?: boolean;
  dataType: ColumnDataType | string;
  defaultValue?: unknown;
  execOrder?: number;
  metadata?: KeyValueMap;
  rules?: KeyValueMap[];
  displayOrder?: number;
  columnType?: string;
  colDef?: ColDef;
  isList?: boolean;
}

export interface GridConfig {
  columns: ColumnConfig[];
  customFunctions?: any[];
  dataSources?: any[];
}

export interface ColumnTypes {
  [key: string]: ColDef;
}

export type TableType = 'default' | 'large';
