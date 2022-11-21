import { Select, OptionType } from '@cognite/cogs.js';
import styled from 'styled-components';
import { TimePeriodProps } from './types';
import { relativeTimeOptions } from './constants';

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
