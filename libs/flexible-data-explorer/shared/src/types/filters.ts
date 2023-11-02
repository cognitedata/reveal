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

export type ExistanceOperator = Operator.IS_SET | Operator.IS_NOT_SET;

export type StringOperator =
  | Operator.STARTS_WITH
  | Operator.NOT_STARTS_WITH
  | Operator.EQUALS
  | Operator.NOT_EQUALS
  | ExistanceOperator;

export type NumberOperator =
  | Operator.BETWEEN
  | Operator.NOT_BETWEEN
  | Operator.GREATER_THAN
  | Operator.LESS_THAN
  | Operator.EQUALS
  | Operator.NOT_EQUALS
  | ExistanceOperator;

export type DateOperator =
  | Operator.BEFORE
  | Operator.NOT_BEFORE
  | Operator.BETWEEN
  | Operator.NOT_BETWEEN
  | Operator.AFTER
  | Operator.NOT_AFTER
  | Operator.ON
  | Operator.NOT_ON
  | ExistanceOperator;

export type BooleanOperator =
  | Operator.IS_TRUE
  | Operator.IS_FALSE
  | ExistanceOperator;

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

export interface DataTypeOption<T = unknown> extends DataType {
  fields: Field<T>[];
}

export type FieldType = 'string' | 'number' | 'date' | 'boolean';

export type Property<T = unknown> = DeepKeyOf<T> extends never
  ? string
  : DeepKeyOf<T>;

interface BaseField<T = unknown> {
  id: Property<T>;
  displayName?: string;
  exist?: boolean;
}
interface StringField<T = unknown> extends BaseField<T> {
  type: 'string';
  operators?: StringOperator[];
}
interface NumberField<T = unknown> extends BaseField<T> {
  type: 'number';
  operators?: NumberOperator[];
}
interface DateField<T = unknown> extends BaseField<T> {
  type: 'date';
  operators?: DateOperator[];
}
interface BooleanField<T = unknown> extends BaseField<T> {
  type: 'boolean';
  operators?: BooleanOperator[];
}
export type Field<T = unknown> =
  | StringField<T>
  | NumberField<T>
  | DateField<T>
  | BooleanField<T>;

export type ValueByDataType = Record<string, ValueByField>;

// TODO: Fix type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ValueByField<T = unknown> = Record<string, FieldValue>;

export interface FieldValue {
  operator: Operator;
  value: ValueType;
  type: FieldType;
}
