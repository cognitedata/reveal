import { BaseFilterInput } from '../../../components';
import { FilterInputProps } from '../FilterInput';

export type DateInputProps = FilterInputProps<Date>;

export const DateInput: React.FC<DateInputProps> = ({ ...rest }) => {
  return <BaseFilterInput {...rest} type="datetime-local" />;
};
