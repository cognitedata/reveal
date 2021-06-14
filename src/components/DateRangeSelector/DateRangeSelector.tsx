import React from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components/macro';
import { DateRange, SegmentedControl } from '@cognite/cogs.js';
import { Chart } from 'reducers/charts/types';
import TimeSelector from 'components/TimeSelector';
import { useUpdateChart } from 'hooks/firebase';
import { trackUsage } from 'utils/metrics';

interface DateRangeSelectorProps {
  chart: Chart;
}

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

const DateRangeSelector = ({ chart }: DateRangeSelectorProps) => {
  const { mutate: updateChart } = useUpdateChart();

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
      updateChart({
        ...chart,
        dateFrom: (dateFrom || new Date(chart?.dateFrom!)).toJSON(),
        dateTo: (dateTo || new Date(chart?.dateTo!)).toJSON(),
      });
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
  };

  return (
    <Wrapper>
      <Column>
        <SegmentedControl
          currentKey="1M"
          variant="ghost"
          onButtonClicked={handleTimeOptionSelected}
        >
          {relativeTimeOptions.map((option) => (
            <SegmentedControl.Button key={option.label}>
              {option.label}
            </SegmentedControl.Button>
          ))}
        </SegmentedControl>
      </Column>
      <Column>
        <DateRange
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
                    handleDateChange({ dateFrom: value });
                  }}
                />
              </div>
              <div>
                <TimeSelector
                  value={new Date(chart.dateTo)}
                  onChange={(value) => {
                    handleDateChange({ dateTo: value });
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
