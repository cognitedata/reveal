import { ComponentStory } from '@storybook/react';
import { TIME_SELECT } from 'containers';
import React, { useState } from 'react';
import styled from 'styled-components';
import { TimeseriesSearchResults } from './TimeseriesSearchResults';

export default {
  title: 'Search Results/TimeseriesSearchResults',
  component: TimeseriesSearchResults,
  argTypes: {
    query: { control: 'text' },
    showDatePicker: { control: 'boolean' },
  },
};

export const Example: ComponentStory<typeof TimeseriesSearchResults> = args => {
  const [dateRange, setDateRange] = useState<[Date, Date]>(
    TIME_SELECT['2Y'].getTime()
  );
  const onDateRange = (newDate: [Date, Date]) => {
    setDateRange(newDate);
  };
  return (
    <Container>
      <TimeseriesSearchResults
        {...args}
        dateRange={dateRange}
        onDateRangeChange={onDateRange}
      />
    </Container>
  );
};

Example.args = {
  showDatePicker: true,
  showCount: true,
};

const Container = styled.div`
  height: 800px;
`;
