import styled from 'styled-components';

import { Select, OptionType } from '@cognite/cogs.js';

import { relativeTimeOptions } from './constants';
import { TimePeriodProps } from './types';

type TimePeriodOption = OptionType<TimePeriodProps['optionSelected']>;

const StyledSelect = styled(Select)`
  margin-left: 12px;
  width: 80px;
`;

export const TimePeriodMenu = (props: TimePeriodProps) => {
  const { onPeriodChange, optionSelected } = props;

  return (
    <StyledSelect
      options={relativeTimeOptions.map(
        ({ label }): TimePeriodOption => ({
          label: label.toUpperCase(),
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
