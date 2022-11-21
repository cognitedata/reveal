import { Button } from '@cognite/cogs.js';
import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { TimePeriodProps } from './types';
import { relativeTimeOptions } from './constants';

const TimePeriodSelector = ({
  onPeriodChange,
  optionSelected,
  ...rest
}: TimePeriodProps &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  return (
    <div {...rest}>
      {relativeTimeOptions.map(({ label }) => (
        <Button
          toggled={label === optionSelected}
          type={label === optionSelected ? 'secondary' : 'ghost'}
          key={label}
          onClick={() => onPeriodChange(label)}
          style={{ padding: '8px 12px' }}
        >
          {label.toUpperCase()}
        </Button>
      ))}
    </div>
  );
};
export default TimePeriodSelector;
