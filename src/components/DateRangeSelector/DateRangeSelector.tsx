import React from 'react';
import dayjs from 'dayjs';
import styled from 'styled-components/macro';
import { Button, DateRange } from '@cognite/cogs.js';
import { Chart } from 'reducers/charts/types';
import TimeSelector from 'components/TimeSelector';
import { useUpdateChart } from 'hooks/firebase';

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
  }: {
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    if (dateFrom && dateTo) {
      updateChart({
        ...chart,
        dateFrom: (dateFrom || new Date(chart?.dateFrom!)).toJSON(),
        dateTo: (dateTo || new Date(chart?.dateTo!)).toJSON(),
      });
    }
  };

  return (
    <Wrapper>
      <Column>
        {relativeTimeOptions.map((option) => (
          <Button
            key={option.label}
            onClick={() =>
              handleDateChange({
                dateFrom: option.dateFrom().toDate(),
                dateTo: option.dateTo().toDate(),
              })
            }
            type="ghost"
          >
            {option.label}
          </Button>
        ))}
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
