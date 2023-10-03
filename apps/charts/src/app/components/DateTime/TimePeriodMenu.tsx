import styled from 'styled-components';

import { Select, OptionType } from '@cognite/cogs.js';

import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';

import { relativeTimeOptions } from './constants';
import { TimePeriodProps } from './types';

type TimePeriodOption = OptionType<TimePeriodProps['optionSelected']>;

const StyledSelect = styled(Select)`
  margin-left: 12px;
  width: 80px;
`;

// Extract labels from relativeTimeOptions
const getLabels = (options: typeof relativeTimeOptions) =>
  options.map((option) => option.label);

const defaultTranslations = makeDefaultTranslations(
  ...getLabels(relativeTimeOptions)
);

export const TimePeriodMenu = (props: TimePeriodProps) => {
  const { onPeriodChange, optionSelected } = props;
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'TimePicker').t,
  };

  return (
    <StyledSelect
      options={relativeTimeOptions.map(
        ({ label }): TimePeriodOption => ({
          label: t[label],
          value: label,
        })
      )}
      value={
        optionSelected
          ? { label: optionSelected.toUpperCase(), value: optionSelected }
          : undefined
      }
      onChange={(newOption: TimePeriodOption) =>
        onPeriodChange(newOption.value || '')
      }
      placeholder="-"
    />
  );
};
