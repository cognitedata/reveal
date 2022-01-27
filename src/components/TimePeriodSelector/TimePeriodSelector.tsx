import dayjs from 'dayjs';
import { Button } from '@cognite/cogs.js';
import { trackUsage } from 'services/metrics';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import { useState } from 'react';
import { updateChartDateRange } from 'models/chart/updates';

const relativeTimeOptions = [
  {
    label: '1D',
    dateFrom: () => dayjs().subtract(1, 'day').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '2D',
    dateFrom: () => dayjs().subtract(2, 'day').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '1W',
    dateFrom: () => dayjs().subtract(1, 'week').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '1M',
    dateFrom: () => dayjs().subtract(1, 'month').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '6M',
    dateFrom: () => dayjs().subtract(6, 'months').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
  {
    label: '1Y',
    dateFrom: () => dayjs().subtract(1, 'year').startOf('minute'),
    dateTo: () => dayjs().endOf('minute'),
  },
];

const TimePeriodSelector = () => {
  const [chart, setChart] = useRecoilState(chartAtom);
  const [[selectedRange, selectedDateFrom, selectedDateTo], setSelectedRange] =
    useState<[string | undefined, string | undefined, string | undefined]>([
      undefined,
      undefined,
      undefined,
    ]);

  if (!chart) {
    return null;
  }

  const handleDateChange = ({
    dateFrom,
    dateTo,
  }: {
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    if (dateFrom || dateTo) {
      setChart((oldChart) => updateChartDateRange(oldChart!, dateFrom, dateTo));
      trackUsage('ChartView.DateChange', { source: 'button' });
    }
  };

  const handleTimeOptionSelected = (selectedOption: string) => {
    const selectedTimeOption = relativeTimeOptions.find(
      (option) => option.label === selectedOption
    );

    handleDateChange({
      dateFrom: selectedTimeOption?.dateFrom().toDate(),
      dateTo: selectedTimeOption?.dateTo().toDate(),
    });

    setSelectedRange([
      selectedTimeOption?.label,
      selectedTimeOption?.dateFrom().toISOString(),
      selectedTimeOption?.dateTo().toISOString(),
    ]);
  };

  const shouldShowRangeSelectionAsActive =
    chart?.dateFrom === selectedDateFrom && chart?.dateTo === selectedDateTo;

  return (
    <div>
      {relativeTimeOptions.map((option) => (
        <Button
          type={
            shouldShowRangeSelectionAsActive && selectedRange === option.label
              ? 'secondary'
              : 'ghost'
          }
          toggled={
            shouldShowRangeSelectionAsActive && selectedRange === option.label
          }
          key={option.label}
          onClick={() => handleTimeOptionSelected(option.label)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default TimePeriodSelector;
