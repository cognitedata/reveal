import { Select } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import { Integration } from 'model/Integration';
import { OptionTypeBase } from 'react-select';
import { CSSObject } from '@emotion/serialize';

type ScheduleValue = Pick<Integration, 'schedule'>;
const customStyles = {
  control: (styles: CSSObject) => ({
    ...styles,
    backgroundColor: 'white',
    color: 'red',
  }),
};
const options = [
  {
    value: SupportedScheduleStrings.SCHEDULED,
    label: SupportedScheduleStrings.SCHEDULED,
  },
  {
    value: SupportedScheduleStrings.CONTINUOUS,
    label: SupportedScheduleStrings.CONTINUOUS,
  },
  {
    value: SupportedScheduleStrings.ON_TRIGGER,
    label: SupportedScheduleStrings.ON_TRIGGER,
  },
  {
    value: SupportedScheduleStrings.NOT_DEFINED,
    label: SupportedScheduleStrings.NOT_DEFINED,
  },
];

interface SelectorProps extends ScheduleValue {
  inputId?: string;
  onSelectChange: (e: OptionTypeBase) => void;
  handleOnBlur?: (e: React.FocusEvent) => void;
}

export const ScheduleSelector: FunctionComponent<SelectorProps> = ({
  inputId,
  schedule,
  onSelectChange,
  handleOnBlur,
}: PropsWithChildren<SelectorProps>) => {
  const selectedValue = (scheduleValue?: string) => {
    return options.filter(({ value }) => {
      return value === scheduleValue;
    })[0];
  };

  function handleChange(selected: OptionTypeBase) {
    onSelectChange(selected);
  }

  return (
    <Select
      inputId={inputId}
      defaultValue={selectedValue(schedule)}
      options={options}
      styles={customStyles}
      onChange={handleChange}
      onBlur={handleOnBlur}
      menuPosition="fixed"
      autoFocus
    />
  );
};
