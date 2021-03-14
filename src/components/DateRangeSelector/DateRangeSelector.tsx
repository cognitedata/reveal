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

const startOfDay = dayjs().startOf('day');
const endOfDay = dayjs().endOf('day');

const relativeTimeOptions = [
  {
    label: '1D',
    dateFrom: startOfDay,
    dateTo: endOfDay,
  },
  {
    label: '2D',
    dateFrom: startOfDay.subtract(1, 'day'),
    dateTo: endOfDay,
  },
  {
    label: '1W',
    dateFrom: startOfDay.subtract(1, 'week'),
    dateTo: endOfDay,
  },
  {
    label: '1M',
    dateFrom: startOfDay.subtract(1, 'month'),
    dateTo: endOfDay,
  },
  {
    label: '6M',
    dateFrom: startOfDay.subtract(6, 'months'),
    dateTo: endOfDay,
  },
  {
    label: '1Y',
    dateFrom: startOfDay.subtract(1, 'year'),
    dateTo: endOfDay,
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
        chart: {
          ...chart,
          dateFrom: (dateFrom || new Date(chart?.dateFrom!)).toJSON(),
          dateTo: (dateTo || new Date(chart?.dateTo!)).toJSON(),
        },
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
                dateFrom: option.dateFrom.toDate(),
                dateTo: option.dateTo.toDate(),
              })
            }
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
