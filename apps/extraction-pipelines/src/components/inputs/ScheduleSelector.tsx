import React, { FunctionComponent, PropsWithChildren } from 'react';

import { Select } from 'antd';

import { TranslationKeys, useTranslation } from '../../common';
import { Extpipe } from '../../model/Extpipe';
import { SupportedScheduleStrings } from '../extpipes/cols/Schedule';

type ScheduleValue = Pick<Extpipe, 'schedule'>;

interface SelectorProps extends ScheduleValue {
  onSelectChange: (value: string) => void;
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

  const handleChange = (selected: string) => {
    onSelectChange(selected);
  };

  return (
    <Select
      allowClear
      value={schedule}
      options={options}
      onChange={handleChange}
      placeholder={t('select-schedule')}
    />
  );
};
