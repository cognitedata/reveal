import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { TimePeriod, UpdateTimePeriodProps } from '../../types';
import { TimePeriodsWrapper } from './elements';
import { TimePeriodButton } from './TimePeriodButton';

export interface TimePeriodsProps {
  options: TimePeriod[];
  value?: TimePeriod;
  onChange: (props: UpdateTimePeriodProps) => void;
}

export const TimePeriods: React.FC<TimePeriodsProps> = ({
  options,
  value,
  onChange,
}) => {
  if (isEmpty(options)) {
    return null;
  }

  return (
    <TimePeriodsWrapper>
      {options.map((timePeriod) => {
        return (
          <TimePeriodButton
            key={timePeriod}
            timePeriod={timePeriod}
            isSelected={timePeriod === value}
            onClick={onChange}
          />
        );
      })}
    </TimePeriodsWrapper>
  );
};
