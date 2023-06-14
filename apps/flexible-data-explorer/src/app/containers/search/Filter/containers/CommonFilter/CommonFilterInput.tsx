import {
  NumericRangeInput,
  DateTimeInput,
  DateTimeRangeInput,
  NoInput,
  TextInput,
  NumberInput,
} from '../../components';
import {
  DateRange,
  InputControlProps,
  InputType,
  NumericRange,
  ValueType,
} from '../../types';

export interface CommonFilterInputProps extends InputControlProps<ValueType> {
  type: InputType;
}

export const CommonFilterInput: React.FC<CommonFilterInputProps> = ({
  type,
  ...props
}) => {
  if (type === 'string') {
    return <TextInput {...(props as InputControlProps<string>)} />;
  }

  if (type === 'number') {
    return <NumberInput {...(props as InputControlProps<number>)} />;
  }

  if (type === 'numeric-range') {
    return (
      <NumericRangeInput {...(props as InputControlProps<NumericRange>)} />
    );
  }

  if (type === 'date') {
    return <DateTimeInput {...(props as InputControlProps<Date>)} />;
  }

  if (type === 'date-range') {
    return <DateTimeRangeInput {...(props as InputControlProps<DateRange>)} />;
  }

  return <NoInput />;
};
