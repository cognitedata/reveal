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
  BaseInputProps,
  InputType,
  NumericRange,
  ValueType,
} from '../../types';

export interface CommonFilterInputProps extends BaseInputProps<ValueType> {
  type: InputType;
}

export const CommonFilterInput: React.FC<CommonFilterInputProps> = ({
  type,
  ...props
}) => {
  if (type === 'string') {
    return <TextInput {...(props as BaseInputProps<string>)} />;
  }

  if (type === 'number') {
    return <NumberInput {...(props as BaseInputProps<number>)} />;
  }

  if (type === 'numeric-range') {
    return <NumericRangeInput {...(props as BaseInputProps<NumericRange>)} />;
  }

  if (type === 'date') {
    return <DateTimeInput {...(props as BaseInputProps<Date>)} />;
  }

  if (type === 'date-range') {
    return <DateTimeRangeInput {...(props as BaseInputProps<DateRange>)} />;
  }

  return <NoInput />;
};
