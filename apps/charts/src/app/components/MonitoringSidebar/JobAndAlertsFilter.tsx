import styled from 'styled-components';

import { Select, OptionType } from '@cognite/cogs.js';

import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';

export type FilterOption = OptionType<'all' | 'current' | 'subscribed'>;

const FilterSelect = styled(Select)`
  margin-bottom: 12px;
`;

const defaultTranslation = makeDefaultTranslations(
  'All folders',
  'Subscribed to',
  'In current chart',
  'All',
  'Show'
);

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
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'AlertingSidebar').t,
  };

  const transformOptionsWithTranslation = (
    options: FilterOption[],
    ts: typeof defaultTranslation
  ): FilterOption[] => {
    return options.map((option) => ({
      ...option,
      label: ts[option.label as keyof typeof ts],
    }));
  };

  return (
    <FilterSelect
      value={value}
      onChange={onChange}
      options={
        mode === 'alerting'
          ? transformOptionsWithTranslation(ALERTING_FILTER_OPTIONS, t)
          : transformOptionsWithTranslation(MONITORING_FILTER_OPTIONS, t)
      }
      title={`${t['Show']}:`}
    />
  );
};
