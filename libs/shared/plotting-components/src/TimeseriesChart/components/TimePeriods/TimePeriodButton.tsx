import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from '../../../useTranslation';
import { TimePeriod, UpdateTimePeriodProps } from '../../types';
import {
  getDateRangeForTimePeriod,
  getTimePeriodTranslationKey,
} from '../../utils/getDateRangeForTimePeriod';
import { getTimePeriodData } from '../../utils/getTimePeriodData';

export interface TimePeriodButtonProps {
  timePeriod: TimePeriod;
  isSelected?: boolean;
  onClick: (props: UpdateTimePeriodProps) => void;
}

export const TimePeriodButton: React.FC<TimePeriodButtonProps> = ({
  timePeriod,
  isSelected = false,
  onClick,
}) => {
  const { t } = useTranslation();

  const { time, period } = getTimePeriodData(timePeriod);
  const translationKey = getTimePeriodTranslationKey(period);

  const handleClick = () => {
    const dateRange = getDateRangeForTimePeriod(timePeriod);
    onClick({ timePeriod, dateRange });
  };

  return (
    <Button
      type="secondary"
      size="medium"
      toggled={isSelected}
      onClick={handleClick}
      style={{
        padding: 8,
      }}
    >
      {t(translationKey, timePeriod, { time })}
    </Button>
  );
};
