import styled from 'styled-components';

import { Select, OptionType } from '@cognite/cogs.js';

export type FilterOption = OptionType<'all' | 'current' | 'subscribed'>;

const FilterSelect = styled(Select)`
  margin-bottom: 12px;
`;

export const MONITORING_FILTER_OPTIONS: FilterOption[] = [
  { label: 'All folders', value: 'all' },
  { label: 'In current chart', value: 'current' },
  { label: 'Subscribed to', value: 'subscribed' },
];

export const ALERTING_FILTER_OPTIONS: FilterOption[] = [
  { label: 'Subscribed to', value: 'subscribed' },
  { label: 'In current chart', value: 'current' },
  { label: 'All', value: 'all' },
];

export const JobAndAlertsFilter = ({
  onChange,
  value,
  mode,
}: {
  onChange: (option: FilterOption) => void;
  value: FilterOption;
  mode: 'alerting' | 'monitoring';
}) => {
  return (
    <FilterSelect
      value={value}
      onChange={onChange}
      options={
        mode === 'alerting'
          ? ALERTING_FILTER_OPTIONS
          : MONITORING_FILTER_OPTIONS
      }
      title="Show:"
    />
  );
};
