import {
  Operator,
  StringOperator,
  NumberOperator,
  DateOperator,
  BooleanOperator,
} from './operators';

export * from './operators';

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

export interface BaseFilterProps<T extends Operator> {
  operators?: T[];
  value?: FieldValue;
  name: string;
  onBackClick: () => void;
  onApplyClick: (operator: T, value: ValueType<InputType>) => void;
}

export interface DataType {
  name: string;
  description?: string;
}

export interface Field {
  name: string;
  type: FieldType;
}

export type FieldType = 'string' | 'number' | 'date' | 'boolean';

export interface OperatorConfig {
  string: StringOperator[];
  number: NumberOperator[];
  date: DateOperator[];
  boolean: BooleanOperator[];
}

export interface DataTypeOption extends DataType {
  fields: Field[];
}

export type ValueByDataType = Record<string, ValueByField>;

export type ValueByField = Record<string, FieldValue>;

export interface FieldValue {
  operator: Operator;
  value: ValueType<InputType>;
}
