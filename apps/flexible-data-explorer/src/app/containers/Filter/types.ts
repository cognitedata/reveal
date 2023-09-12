// The values in this list is derived from the translation keys.
export enum Operator {
  STARTS_WITH = 'FILTER_OPERATOR_STARTS_WITH',
  NOT_STARTS_WITH = 'FILTER_OPERATOR_NOT_STARTS_WITH',
  CONTAINS = 'FILTER_OPERATOR_CONTAINS',
  NOT_CONTAINS = 'FILTER_OPERATOR_NOT_CONTAINS',
  BETWEEN = 'FILTER_OPERATOR_BETWEEN',
  NOT_BETWEEN = 'FILTER_OPERATOR_NOT_BETWEEN',
  GREATER_THAN = 'FILTER_OPERATOR_GREATER_THAN',
  LESS_THAN = 'FILTER_OPERATOR_LESS_THAN',
  EQUALS = 'FILTER_OPERATOR_EQUALS',
  NOT_EQUALS = 'FILTER_OPERATOR_NOT_EQUALS',
  BEFORE = 'FILTER_OPERATOR_BEFORE',
  NOT_BEFORE = 'FILTER_OPERATOR_NOT_BEFORE',
  AFTER = 'FILTER_OPERATOR_AFTER',
  NOT_AFTER = 'FILTER_OPERATOR_NOT_AFTER',
  ON = 'FILTER_OPERATOR_ON',
  NOT_ON = 'FILTER_OPERATOR_NOT_ON',
  IS_TRUE = 'FILTER_OPERATOR_TRUE',
  IS_FALSE = 'FILTER_OPERATOR_FALSE',
  IS_SET = 'FILTER_OPERATOR_SET',
  IS_NOT_SET = 'FILTER_OPERATOR_NOT_SET',
}

export type NumericRange = [number, number];

export type DateRange = [Date, Date];

export type InputValueTypeMap = {
  string: string;
  number: number;
  'numeric-range': NumericRange;
  date: Date;
  'date-range': DateRange;
  boolean: boolean;
  'no-input': never;
};

export type InputType =
  | 'string'
  | 'number'
  | 'numeric-range'
  | 'date'
  | 'date-range'
  | 'boolean'
  | 'no-input';

export type ValueType =
  | string
  | number
  | NumericRange
  | Date
  | DateRange
  | boolean
  | never;

export type Suggestion = string;

export interface BaseInputProps<T extends ValueType> {
  value?: T;
  onChange: (value?: T) => void;
  suggestions?: Suggestion[];
  isSuggestionsLoading?: boolean;
  helpText?: string;
}

export interface DataType {
  name: string;
  displayName?: string;
  description?: string;
}

export interface DataTypeOption extends DataType {
  fields: Field[];
}

export type FieldType = 'string' | 'number' | 'date' | 'boolean';

export interface Field {
  name: string;
  displayName?: string;
  type: FieldType;
  operators?: Operator[];
}

export type ValueByDataType = Record<string, ValueByField>;

export type ValueByField = Record<string, FieldValue>;

export interface FieldValue {
  operator: Operator;
  value: ValueType;
}
