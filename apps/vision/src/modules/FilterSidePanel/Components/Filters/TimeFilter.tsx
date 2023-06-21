import React from 'react';
import { Button, Title } from '@cognite/cogs.js';
import { TimePicker } from 'antd';
import styled from 'styled-components';
import moment from 'moment';
import { DateRange } from '@cognite/sdk';
import { VisionFilterItemProps } from 'src/modules/FilterSidePanel/types';

export const timeFormat = 'hh:mm A';

enum TimeOptions {
  day = 'Day',
  night = 'Night',
  morning = 'Morning',
  afternoon = 'Afternoon',
}

const predefinedTimeRanges: Record<TimeOptions, DateRange> = {
  Day: {
    min: moment('6:00 AM', timeFormat).valueOf(),
    max: moment('6:00 PM', timeFormat).valueOf(),
  },
  Night: {
    min: moment('6:00 PM', timeFormat).valueOf(),
    max: moment('11:59 PM', timeFormat).valueOf(),
  },
  Morning: {
    min: moment('6:00 AM', timeFormat).valueOf(),
    max: moment('9:00 AM', timeFormat).valueOf(),
  },
  Afternoon: {
    min: moment('12:00 PM', timeFormat).valueOf(),
    max: moment('3:00 PM', timeFormat).valueOf(),
  },
};

export const TimeFilter = ({ filter, setFilter }: VisionFilterItemProps) => {
  const handlePredefinedTimeRangeClicked = (timeRange: DateRange) => {
    setFilter({
      ...filter,
      timeRange,
    });
  };

  const setTimeFilter = (timeRange: DateRange | undefined) => {
    let newTimeRange = timeRange;
    if (newTimeRange && !newTimeRange.min && !newTimeRange.max) {
      newTimeRange = undefined;
    }
    setFilter({
      ...filter,
      timeRange: newTimeRange,
    });
  };
  // todo: remove code duplication
  const handleFirstTimeChange = (time: moment.Moment | null) => {
    let newTime: moment.Moment | null | undefined = time;
    if (!newTime) {
      newTime = undefined;
    }
    const newTimeRange: DateRange | undefined = {
      ...filter.timeRange,
      min: newTime?.valueOf(),
    };
    setTimeFilter(newTimeRange);
  };
  const handleSecondTimeChange = (time: moment.Moment | null) => {
    let newTime: moment.Moment | null | undefined = time;
    if (!newTime) {
      newTime = undefined;
    }
    const newTimeRange: DateRange | undefined = {
      ...filter.timeRange,
      max: newTime?.valueOf(),
    };
    setTimeFilter(newTimeRange);
  };

  return (
    <Container>
      <Title level={6}> Time </Title>

      <OptionContainer>
        {Object.entries(predefinedTimeRanges).map((predefinedRange) => (
          <Button
            type="tertiary"
            size="small"
            key={predefinedRange[0]}
            onClick={() => handlePredefinedTimeRangeClicked(predefinedRange[1])}
          >
            {predefinedRange[0]}
          </Button>
        ))}
      </OptionContainer>

      <TimePickerContainer>
        <TimePicker
          value={
            filter.timeRange?.min ? moment(filter.timeRange?.min) : undefined
          }
          onChange={handleFirstTimeChange}
          style={{ backgroundColor: '#ffffff' }}
          format={timeFormat}
        />
        <TimePicker
          value={
            filter.timeRange?.max ? moment(filter.timeRange?.max) : undefined
          }
          onChange={handleSecondTimeChange}
          style={{ backgroundColor: '#ffffff' }}
          format={timeFormat}
        />
      </TimePickerContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
  margin-top: 25px;
`;

const OptionContainer = styled.div`
  display: flex;
  gap: 6px;
`;
const TimePickerContainer = styled.div`
  display: flex;
  gap: 6px;
`;
