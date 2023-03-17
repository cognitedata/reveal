import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { TimePeriod, UpdateTimePeriodProps } from '../../types';
import { getDateRangeForTimePeriod } from '../../utils/getDateRangeForTimePeriod';

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
      {timePeriod}
    </Button>
  );
};
