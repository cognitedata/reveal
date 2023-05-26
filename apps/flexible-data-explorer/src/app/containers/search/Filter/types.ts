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
  boolean: 'boolean';
  'no-input': never;
};

export type ValueType<K extends keyof InputValueTypeMap> = InputValueTypeMap[K];

export type InputType = keyof InputValueTypeMap;

export interface InputControlProps<T extends InputType> {
  value?: ValueType<T>;
  onChange: (value: ValueType<T>) => void;
}

export type BaseConfig = Record<string, InputType>;

export type ApplyFilterCallback<TConfig extends BaseConfig> = <
  K extends keyof TConfig
>(
  operator: K,
  value: ValueType<TConfig[K]>
) => void;

export interface BaseFilterProps<TConfig extends BaseConfig> {
  value?: FieldValue;
  name: string;
  onBackClick: () => void;
  onApplyClick: ApplyFilterCallback<TConfig>;
}

export interface DataType {
  name: string;
  description?: string;
}

export interface Field {
  name: string;
  type: FieldType;
}

export type FieldType = 'string' | 'number' | 'boolean' | 'date';

export interface Option extends DataType {
  fields: Field[];
}

export interface FieldValue {
  operator: Operator;
  value: ValueType<InputType>;
}

export type FilterValue = Record<string, Record<string, FieldValue>>;
