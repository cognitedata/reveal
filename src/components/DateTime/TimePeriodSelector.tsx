import dayjs from 'dayjs';
import { Button } from '@cognite/cogs.js';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

export const relativeTimeOptions = [
  {
    label: '1d' as const,
    dateFrom: () => dayjs().subtract(1, 'day').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '2d' as const,
    dateFrom: () => dayjs().subtract(2, 'day').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '1w' as const,
    dateFrom: () => dayjs().subtract(1, 'week').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '1M' as const,
    dateFrom: () => dayjs().subtract(1, 'month').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '6M' as const,
    dateFrom: () => dayjs().subtract(6, 'months').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '1y' as const,
    dateFrom: () => dayjs().subtract(1, 'year').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
];

type Props = {
  onPeriodClick: (period: typeof relativeTimeOptions[number]['label']) => void;
  optionSelected: typeof relativeTimeOptions[number]['label'] | '';
};

const TimePeriodSelector = ({
  onPeriodClick,
  optionSelected,
  ...rest
}: Props &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
  return (
    <div {...rest}>
      {relativeTimeOptions.map(({ label }) => (
        <Button
          toggled={label === optionSelected}
          type={label === optionSelected ? 'secondary' : 'ghost'}
          key={label}
          onClick={() => onPeriodClick(label)}
          style={{ padding: '8px 12px' }}
        >
          {label.toUpperCase()}
        </Button>
      ))}
    </div>
  );
};
export default TimePeriodSelector;
