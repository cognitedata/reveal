import { Select } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import { SupportedScheduleStrings } from 'components/extpipes/cols/Schedule';
import { Extpipe } from 'model/Extpipe';
import { OptionTypeBase } from 'react-select';
import { CSSObject } from '@emotion/serialize';
import { TranslationKeys, useTranslation } from 'common';

type ScheduleValue = Pick<Extpipe, 'schedule'>;

interface SelectorProps extends ScheduleValue {
  inputId?: string;
  autoFocus?: boolean;
  onSelectChange: (e: OptionTypeBase) => void;
  handleOnBlur?: (e: React.FocusEvent) => void;
}

const customStyles = {
  control: (styles: CSSObject) => ({
    ...styles,
    backgroundColor: 'white',
    color: 'red',
  }),
};

const getOptions = (_t: (key: TranslationKeys) => string) => {
  const options = [
    {
      value: SupportedScheduleStrings.SCHEDULED,
      label: _t('scheduled'),
    },
    {
      value: SupportedScheduleStrings.CONTINUOUS,
      label: _t('continuous'),
    },
    {
      value: SupportedScheduleStrings.ON_TRIGGER,
      label: _t('on-trigger'),
    },
    {
      value: SupportedScheduleStrings.NOT_DEFINED,
      label: _t('not-defined'),
    },
  ];
  return { options };
};

export const ScheduleSelector: FunctionComponent<SelectorProps> = ({
  inputId,
  schedule,
  onSelectChange,
  handleOnBlur,
  autoFocus = false,
}: PropsWithChildren<SelectorProps>) => {
  const { t } = useTranslation();
  const { options } = getOptions(t);

  const selectedValue = (scheduleValue?: string) => {
    return options.find(({ value }) => {
      return value === scheduleValue;
    })!;
  };

  const handleChange = (selected: OptionTypeBase) => {
    onSelectChange(selected);
  };

  return (
    <Select
      inputId={inputId}
      value={selectedValue(schedule)}
      options={options}
      styles={customStyles}
      onChange={handleChange}
      onBlur={handleOnBlur}
      menuPosition="fixed"
      autoFocus={autoFocus}
      placeholderSelectText={t('select-schedule')}
    />
  );
};
