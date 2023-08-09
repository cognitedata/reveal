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
  Operator,
} from '../../types';

export interface CommonFilterInputProps extends BaseInputProps<ValueType> {
  type: InputType;
  operator: Operator;
}

export const CommonFilterInput: React.FC<CommonFilterInputProps> = ({
  type,
  operator,
  ...props
}) => {
  if (type === 'string') {
    return <TextInput {...(props as BaseInputProps<string>)} />;
  }

  if (type === 'number') {
    const { suggestions } = props;

    return (
      <NumberInput
        {...(props as BaseInputProps<number>)}
        suggestions={
          operator === Operator.GREATER_THAN || operator === Operator.LESS_THAN
            ? undefined
            : suggestions
        }
      />
    );
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
