import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { TimePeriod, UpdateDateRangeProps } from '../../types';
import { getDateRangeForTimePeriod } from '../../utils/getDateRangeForTimePeriod';

export interface TimePeriodButtonProps {
  timePeriod: TimePeriod;
  isSelected?: boolean;
  onClick: (props: UpdateDateRangeProps) => void;
}

export const TimePeriodButton: React.FC<TimePeriodButtonProps> = ({
  timePeriod,
  isSelected = false,
  onClick,
}) => {
  const dateRange = getDateRangeForTimePeriod(timePeriod);

  return (
    <Button
      type="secondary"
      size="medium"
      toggled={isSelected}
      onClick={() => onClick({ timePeriod, dateRange })}
      style={{
        padding: 8,
      }}
    >
      {timePeriod}
    </Button>
  );
};
