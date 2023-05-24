import { useMemo } from 'react';

import { InputControlProps, InputType } from '../../types';
import {
  NumericRangeInput,
  DateTimeInput,
  DateTimeRangeInput,
  NoInput,
  TextInput,
  NumberInput,
} from '../../components';

export interface CommonFilterInputProps<T extends InputType>
  extends InputControlProps<T> {
  type: T;
}

export const CommonFilterInput = <T extends InputType>({
  type,
  ...controlProps
}: CommonFilterInputProps<T>) => {
  const Input: any = useMemo(() => {
    switch (type) {
      case 'string':
        return TextInput;

      case 'number':
        return NumberInput;

      case 'numeric-range':
        return NumericRangeInput;

      case 'date':
        return DateTimeInput;

      case 'date-range':
        return DateTimeRangeInput;

      case 'boolean':
      case 'no-input':
        return NoInput;

      default:
        return NoInput;
    }
  }, [type]);

  return <Input {...controlProps} />;
};
