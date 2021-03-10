import React, { useEffect } from 'react';
import styled from 'styled-components/macro';
import { Button, DateRange } from '@cognite/cogs.js';
import chartsSlice, { Chart } from 'reducers/charts';
import useDispatch from 'hooks/useDispatch';
import TimeSelector from 'components/TimeSelector';

interface DateRangeSelectorProps {
  chart: Chart;
}

const millisecondsInADay = 1000 * 60 * 60 * 24;

const relativeTimeOptions = [
  {
    label: '1D',
    value: millisecondsInADay,
  },
  {
    label: '2D',
    value: 2 * millisecondsInADay,
  },
  {
    label: '1W',
    value: 7 * millisecondsInADay,
  },
  {
    label: '1M',
    value: 30 * millisecondsInADay,
  },
  {
    label: '6M',
    value: 6 * 30 * millisecondsInADay,
  },
  {
    label: '1Y',
    value: 365 * millisecondsInADay,
  },
];

const DateRangeSelector = ({ chart }: DateRangeSelectorProps) => {
  const dispatch = useDispatch();

  const handleDateChange = ({
    dateFrom,
    dateTo,
  }: {
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    dispatch(
      chartsSlice.actions.changeDateRange({
        id: chart?.id || '',
        dateFrom,
        dateTo,
      })
    );
  };

  const updateRelativeDateRange = (millisecondsFromNow: number) => {
    dispatch(
      chartsSlice.actions.updateRelativeDateRange({
        id: chart?.id || '',
        millisecondsFromNow,
      })
    );
  };

  useEffect(() => {
    if (chart.millisecondsFromNow !== undefined) {
      updateRelativeDateRange(chart.millisecondsFromNow);
    }
  }, []);

  return (
    <Wrapper>
      <Column>
        {relativeTimeOptions.map((option) => (
          <Button
            key={option.label}
            variant={
              chart.millisecondsFromNow === option.value ? 'default' : 'ghost'
            }
            onClick={() => updateRelativeDateRange(option.value)}
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
