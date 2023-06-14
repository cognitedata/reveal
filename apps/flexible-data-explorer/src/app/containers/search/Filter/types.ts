export enum Operator {
  STARTS_WITH = 'Starts with',
  NOT_STARTS_WITH = 'Does not start with',
  CONTAINS = 'Contains',
  NOT_CONTAINS = 'Does not contain',
  BETWEEN = 'Is between',
  NOT_BETWEEN = 'Is not between',
  GREATER_THAN = 'Is greater than',
  LESS_THAN = 'Is less than',
  EQUALS = 'Is equal to',
  NOT_EQUALS = 'Is not equal to',
  BEFORE = 'Is before',
  NOT_BEFORE = 'Is not before',
  AFTER = 'Is after',
  NOT_AFTER = 'Is not after',
  ON = 'Is on',
  NOT_ON = 'Is not on',
  IS_TRUE = 'Is true',
  IS_FALSE = 'Is false',
  IS_SET = 'Is set',
  IS_NOT_SET = 'Is not set',
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

export interface InputControlProps<T extends ValueType> {
  value?: T;
  onChange: (value: T) => void;
}

export interface DataType {
  name: string;
  description?: string;
}

export interface DataTypeOption extends DataType {
  fields: Field[];
}

export type FieldType = 'string' | 'number' | 'date' | 'boolean';

export interface Field {
  name: string;
  type: FieldType;
  operators?: Operator[];
}

export type ValueByDataType = Record<string, ValueByField>;

export type ValueByField = Record<string, FieldValue>;

export interface FieldValue {
  operator: Operator;
  value: ValueType;
}
