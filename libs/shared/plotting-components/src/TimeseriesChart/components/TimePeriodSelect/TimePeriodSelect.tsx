import * as React from 'react';
import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { OptionType, Select } from '@cognite/cogs.js';

import { useTranslation } from '../../../useTranslation';
import { TimePeriod, UpdateTimePeriodProps } from '../../types';
import {
  getDateRangeForTimePeriod,
  getTimePeriodTranslationKey,
} from '../../utils/getDateRangeForTimePeriod';
import { getTimePeriodData } from '../../utils/getTimePeriodData';

export interface TimePeriodSelectProps {
  options: TimePeriod[];
  value?: TimePeriod;
  onChange: (props: UpdateTimePeriodProps) => void;
}

export const TimePeriodSelect: React.FC<TimePeriodSelectProps> = ({
  options,
  value: selectedTimePeriod,
  onChange,
}) => {
  const { t } = useTranslation();

  const adaptedOptions = useMemo(() => {
    return options.map((timePeriod) => {
      const { time, period } = getTimePeriodData(timePeriod);
      const translationKey = getTimePeriodTranslationKey(period);

      return {
        label: t(translationKey, timePeriod, { time }),
        value: timePeriod,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleChange = ({ value: timePeriod }: OptionType<TimePeriod>) => {
    if (!timePeriod) {
      return;
    }
    const dateRange = getDateRangeForTimePeriod(timePeriod);
    onChange({ timePeriod, dateRange });
  };

  if (isEmpty(options)) {
    return null;
  }

  return (
    <Select
      title={t('SELECT_OTHER', 'Other:')}
      placeholder={t('SELECT_PLACEHOLDER', 'Select...')}
      width={160}
      theme="grey"
      options={adaptedOptions}
      value={selectedTimePeriod && { label: selectedTimePeriod }}
      onChange={handleChange}
    />
  );
};
