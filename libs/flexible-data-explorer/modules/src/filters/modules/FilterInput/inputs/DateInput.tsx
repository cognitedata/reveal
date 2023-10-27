import { BaseFilterInput } from '../../../components';
import { FilterInputProps } from '../FilterInput';

export type DateInputProps = FilterInputProps<Date>;

export const DateInput: React.FC<DateInputProps> = ({ ...rest }) => {
  return (
    <BaseFilterInput.Single {...rest} data-testid="date-input" type="date" />
  );
};
