import { Select } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import { SupportedScheduleStrings } from 'components/extpipes/cols/Schedule';
import { Extpipe } from 'model/Extpipe';
import { OptionTypeBase } from 'react-select';
import { TranslationKeys, useTranslation } from 'common';

type ScheduleValue = Pick<Extpipe, 'schedule'>;

interface SelectorProps extends ScheduleValue {
  onSelectChange: (e: OptionTypeBase) => void;
}

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
  schedule,
  onSelectChange,
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
      isClearable
      value={selectedValue(schedule)}
      options={options}
      onChange={handleChange}
      menuPosition="fixed"
      placeholderSelectText={t('select-schedule')}
    />
  );
};
