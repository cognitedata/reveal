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
  ...props
}: CommonFilterInputProps<T>) => {
  if (type === 'string') {
    return <TextInput {...(props as InputControlProps<'string'>)} />;
  }

  if (type === 'number') {
    return <NumberInput {...(props as InputControlProps<'number'>)} />;
  }

  if (type === 'numeric-range') {
    return (
      <NumericRangeInput {...(props as InputControlProps<'numeric-range'>)} />
    );
  }

  if (type === 'date') {
    return <DateTimeInput {...(props as InputControlProps<'date'>)} />;
  }

  if (type === 'date-range') {
    return (
      <DateTimeRangeInput {...(props as InputControlProps<'date-range'>)} />
    );
  }

  return <NoInput />;
};
