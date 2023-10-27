import { useMemo } from 'react';

import { InputType, Operator, ValueType } from '@fdx/shared/types/filters';

import {
  BooleanInput,
  DateInput,
  DateRangeInput,
  NoInput,
  NumberInput,
  NumberInputGreaterThan,
  NumberInputLessThan,
  NumericRangeInput,
  StringInput,
} from './inputs';

export interface FilterInputProps<T extends ValueType> {
  value?: T;
  onChange: (value?: T) => void;
  dataType: string;
  field: string;
}

export interface ExtendedFilterInputProps<T extends ValueType>
  extends FilterInputProps<T> {
  type: InputType;
  operator: Operator;
}

export const FilterInput: React.FC<ExtendedFilterInputProps<any>> = ({
  type,
  operator,
  ...props
}) => {
  const InputComponent = useMemo(() => {
    if (type === 'string') {
      return StringInput;
    }

    if (type === 'number') {
      switch (operator) {
        case Operator.LESS_THAN:
          return NumberInputLessThan;

        case Operator.GREATER_THAN:
          return NumberInputGreaterThan;

        default:
          return NumberInput;
      }
    }

    if (type === 'numeric-range') {
      return NumericRangeInput;
    }

    if (type === 'date') {
      return DateInput;
    }

    if (type === 'date-range') {
      return DateRangeInput;
    }

    if (type === 'boolean') {
      return BooleanInput;
    }

    return NoInput;
  }, [operator, type]);

  return <InputComponent {...props} />;
};
