import { Select, OptionType } from '@cognite/cogs.js';
import styled from 'styled-components';

export type FilterOption = OptionType<'all' | 'current' | 'subscribed'>;

const FilterSelect = styled(Select)`
  margin-bottom: 12px;
`;

export const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All folders', value: 'all' },
  { label: 'In current chart', value: 'current' },
  { label: 'Subscribed to', value: 'subscribed' },
];

export const JobAndAlertsFilter = ({
  onChange,
  value,
}: {
  onChange: (option: FilterOption) => void;
  value: FilterOption;
}) => {
  return (
    <FilterSelect
      value={value}
      onChange={onChange}
      options={FILTER_OPTIONS}
      title="Show:"
    />
  );
};
