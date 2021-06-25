import React, { useEffect, useState } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { DatePicker } from 'antd';
import styled from 'styled-components';
import moment from 'moment';
import { DateRange } from '@cognite/cdf-sdk-singleton';
import { FilterItemProps } from './filterItemProps';

const dateFormat = 'DD.MM.YYYY';

export const DateFilter = ({ filter, setFilter }: FilterItemProps) => {
  const [action, setAction] = useState('created');
  const [time, setTime] = useState('before');

  const [startDate, setStartDate] =
    useState<moment.Moment | undefined>(undefined);
  const [endDate, setEndDate] = useState<moment.Moment | undefined>(undefined);

  const clearAll = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  useEffect(() => {
    if (
      filter.createdTime === undefined &&
      filter.uploadedTime === undefined &&
      filter.sourceCreatedTime === undefined
    )
      clearAll();
  }, [filter]);

  useEffect(() => {
    let range: DateRange | undefined;

    // set range according to time
    switch (time) {
      case 'before':
        range = { max: startDate?.valueOf() };
        break;
      case 'after':
        range = { min: startDate?.valueOf() };
        break;
      case 'range':
        range = { min: startDate?.valueOf(), max: endDate?.valueOf() };
        break;
    }

    // set range to undefined if startDate and endDate are undefined
    if (startDate?.valueOf() === undefined && endDate?.valueOf() === undefined)
      range = undefined;

    switch (action) {
      case 'created':
        setFilter({
          ...filter,
          createdTime: range,
        });
        break;
      case 'uploaded':
        setFilter({
          ...filter,
          uploadedTime: range,
        });
        break;
      case 'captured':
        setFilter({
          ...filter,
          sourceCreatedTime: range,
        });
        break;
    }
  }, [action, time, startDate, endDate]);

  return (
    <Container>
      <StyledSegmentedControl
        currentKey={action}
        onButtonClicked={setAction}
        size="small"
      >
        <SegmentedControl.Button key="created">Created</SegmentedControl.Button>
        <SegmentedControl.Button key="uploaded">
          Uploaded
        </SegmentedControl.Button>
        <SegmentedControl.Button key="captured">
          Captured
        </SegmentedControl.Button>
      </StyledSegmentedControl>

      <StyledSegmentedControl
        currentKey={time}
        onButtonClicked={setTime}
        size="small"
        style={{ width: 'fit-content' }}
      >
        <SegmentedControl.Button key="before">Before</SegmentedControl.Button>
        <SegmentedControl.Button key="after">After</SegmentedControl.Button>
        <SegmentedControl.Button key="range">Range</SegmentedControl.Button>
      </StyledSegmentedControl>

      <DatePickersContainer>
        <DatePicker
          value={startDate}
          onChange={(date) => {
            if (date === null) setStartDate(undefined);
            else setStartDate(date);
          }}
          format={dateFormat}
          style={{ backgroundColor: '#ffffff' }}
        />
        <DatePicker
          value={endDate}
          onChange={(date) => {
            if (date === null) setEndDate(undefined);
            else setEndDate(date);
          }}
          format={dateFormat}
          style={{ backgroundColor: '#ffffff' }}
          disabled={time !== 'range'}
        />
      </DatePickersContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
`;

const StyledSegmentedControl = styled(SegmentedControl)`
  width: fit-content;
`;

const DatePickersContainer = styled.div`
  display: flex;
  gap: 6px;
`;
