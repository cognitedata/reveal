import React, { useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { RangePicker } from './RangePicker';

import { PivotRangePicker } from './PivotRangePicker';
import { PivotRange } from './Common';

export default {
  title: 'Component/RangePicker',
  component: RangePicker,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};
export const Example = () => {
  const [startDate, setStartDate] = useState<Date>(
    dayjs().subtract(1, 'year').toDate()
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  return (
    <RangePicker
      initialRange={[startDate, endDate]}
      onRangeChanged={(range: [Date, Date]) => {
        setStartDate(range[0]);
        setEndDate(range[1]);
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
  position: fixed;
`;
