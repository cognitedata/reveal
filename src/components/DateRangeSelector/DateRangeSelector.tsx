import dayjs from 'dayjs';
import styled from 'styled-components/macro';
import { DateRange, Button } from '@cognite/cogs.js';
import TimeSelector from 'components/TimeSelector';
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

const DateRangeSelector = () => {
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
    source = 'daterange',
  }: {
    dateFrom?: Date;
    dateTo?: Date;
    source?: 'button' | 'daterange';
  }) => {
    if (dateFrom || dateTo) {
      setChart((oldChart) => updateChartDateRange(oldChart!, dateFrom, dateTo));
      trackUsage('ChartView.DateChange', { source });
    }
  };

  const handleTimeOptionSelected = (selectedOption: string) => {
    const selectedTimeOption = relativeTimeOptions.find(
      (option) => option.label === selectedOption
    );

    handleDateChange({
      dateFrom: selectedTimeOption?.dateFrom().toDate(),
      dateTo: selectedTimeOption?.dateTo().toDate(),
      source: 'button',
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
    <Wrapper>
      <Column>
        <div>
          {relativeTimeOptions.map((option) => (
            <Button
              type={
                shouldShowRangeSelectionAsActive &&
                selectedRange === option.label
                  ? 'secondary'
                  : 'ghost'
              }
              toggled={
                shouldShowRangeSelectionAsActive &&
                selectedRange === option.label
              }
              key={option.label}
              onClick={() => handleTimeOptionSelected(option.label)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Column>
      <Column>
        <DateRange
          format="MMM D, YYYY"
          range={{
            startDate: new Date(chart.dateFrom || new Date()),
            endDate: new Date(chart.dateTo || new Date()),
          }}
          onChange={({ startDate, endDate }) => {
            const currentStart = new Date(chart.dateFrom);
            const currentEnd = new Date(chart.dateTo);

            const newStart = new Date(startDate || new Date());
            newStart.setHours(currentStart.getHours());
            newStart.setMinutes(currentStart.getMinutes());

            const newEnd = new Date(endDate || new Date());
            newEnd.setHours(currentEnd.getHours());
            newEnd.setMinutes(currentEnd.getMinutes());

            handleDateChange({
              dateFrom: newStart,
              dateTo: newEnd,
            });

            // Force mouseup event as it doesn't bubble up for this component
            window.dispatchEvent(new Event('mouseup'));
          }}
          prependComponent={() => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
              }}
            >
              <div>
                <TimeSelector
                  value={new Date(chart.dateFrom)}
                  onChange={(value) => {
                    handleDateChange({
                      dateFrom: value,
                    });
                  }}
                />
              </div>
              <div>
                <TimeSelector
                  value={new Date(chart.dateTo)}
                  onChange={(value) => {
                    handleDateChange({
                      dateTo: value,
                    });
                  }}
                />
              </div>
            </div>
          )}
        />
      </Column>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const Column = styled.div`
  margin: 2px 6px;
`;

export default DateRangeSelector;
