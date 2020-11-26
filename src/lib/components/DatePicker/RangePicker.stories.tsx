import React, { useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { RangePicker } from './RangePicker';
import { CalendarPicker } from './CalendarPicker';
import { PivotRangePicker } from './PivotRangePicker';
import { PivotRange } from './Common';

export default {
  title: 'Component/RangePicker',
  component: RangePicker,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};
export const Example = () => {
  const [startDate, setStartDate] = useState<Date>(
    moment().subtract(1, 'year').toDate()
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  return (
    <RangePicker
      initialRange={[startDate, endDate]}
      onRangeChanged={(start, end) => {
        setStartDate(start);
        setEndDate(end);
      }}
    />
  );
};
export const CalendarPickerExample = () => {
  const [startDate, setStartDate] = useState<Date>(
    moment().subtract(1, 'year').toDate()
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  return (
    <CalendarPicker
      dates={[startDate, endDate]}
      onDatesChanged={(start, end) => {
        setStartDate(start);
        setEndDate(end);
      }}
    />
  );
};
export const PivotRangePickerExample = () => {
  const [range, setRange] = useState<PivotRange>({
    type: 'Pivot',
    date: new Date(),
    amount: 2,
    direction: 'before',
    unit: 'year',
  });
  return <PivotRangePicker range={range} onRangeChanged={setRange} />;
};

const Container = styled.div`
  padding: 20px;
  display: flex;
`;
