import React, { useEffect, useState } from 'react';
import { SegmentedControl, Title } from '@cognite/cogs.js';
import { DatePicker } from 'antd';
import styled from 'styled-components';
import moment from 'moment';
import { DateRange } from '@cognite/sdk';
import {
  DateActions,
  DateFilterType,
  DateOptions,
  VisionFileFilterProps,
  VisionFilterItemProps,
} from 'src/modules/FilterSidePanel/types';

export const dateFormat = 'DD.MM.YYYY';

// Overriding time as date selector get current time as default
const getValidMaxDate = (date: moment.Moment) =>
  date?.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
const getValidMinDate = (date: moment.Moment) =>
  date?.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

const getValue = (filter: VisionFileFilterProps, index: number) => {
  const selectedAction = filter.dateFilter?.action;
  const selectedDateOption = filter.dateFilter?.dateOption;
  let selectedTime;

  switch (selectedAction) {
    case DateActions.created:
    default:
      selectedTime = filter.createdTime;
      break;
    case DateActions.uploaded:
      selectedTime = filter.uploadedTime;
      break;
    case DateActions.captured:
      selectedTime = filter.sourceCreatedTime;
      break;
  }

  if (!selectedTime) {
    return null;
  }

  if (index === 1) {
    switch (selectedDateOption) {
      case DateOptions.before:
      default:
        if (!selectedTime.max) {
          return null;
        }
        return moment(selectedTime.max);
      case DateOptions.after:
      case DateOptions.range:
        if (!selectedTime.min) {
          return null;
        }
        return moment(selectedTime.min);
    }
  }
  if (index === 2) {
    if (!selectedTime.max || selectedDateOption !== DateOptions.range) {
      return null;
    }
    return moment(selectedTime.max);
  }

  return null;
};

export const DateFilter = ({ filter, setFilter }: VisionFilterItemProps) => {
  const [action, setAction] = useState<DateActions | undefined>(
    filter.dateFilter?.action || DateActions.created
  );
  const [dateOption, setDateOption] = useState<DateOptions | undefined>(
    filter.dateFilter?.dateOption || DateOptions.before
  );

  const handleActionChange = (key: string) => {
    setAction(key as DateActions);
    const range =
      filter.createdTime || filter.uploadedTime || filter.sourceCreatedTime;
    if (range) {
      setDateFilter(range, key as DateActions);
    }
  };
  const handleDateOptionChange = (key: string) => {
    setDateOption(key as DateOptions);
    const oldRange =
      filter.createdTime || filter.uploadedTime || filter.sourceCreatedTime;
    if (oldRange) {
      let range: DateRange | undefined;
      switch (key as DateOptions) {
        case DateOptions.before:
        default:
          range = { min: undefined, max: oldRange.max || oldRange.min };
          break;
        case DateOptions.after:
          range = { min: oldRange.min || oldRange.max, max: undefined };
          break;
        case DateOptions.range:
          range = { min: oldRange.min, max: oldRange.max };
          break;
      }
      setDateFilter(range, action);
    }
  };

  const setDateFilter = (range: DateRange, newAction?: DateActions) => {
    let newDateFilter: DateFilterType | undefined = {
      ...filter.dateFilter,
      action: newAction,
      dateOption,
    };
    switch (newAction) {
      case DateActions.created:
      default: {
        let newRange: DateRange | undefined = {
          ...filter.createdTime,
          ...range,
        };
        if (!newRange.min && !newRange.max) {
          newRange = undefined;
          newDateFilter = undefined;
        }
        setFilter({
          ...filter,
          dateFilter: newDateFilter,
          createdTime: newRange,
          uploadedTime: undefined,
          sourceCreatedTime: undefined,
        });
        break;
      }
      case DateActions.uploaded: {
        let newRange: DateRange | undefined = {
          ...filter.uploadedTime,
          ...range,
        };
        if (!newRange.min && !newRange.max) {
          newRange = undefined;
          newDateFilter = undefined;
        }

        setFilter({
          ...filter,
          dateFilter: newDateFilter,
          createdTime: undefined,
          uploadedTime: newRange,
          sourceCreatedTime: undefined,
        });
        break;
      }
      case DateActions.captured: {
        let newRange: DateRange | undefined = {
          ...filter.sourceCreatedTime,
          ...range,
        };
        if (!newRange.min && !newRange.max) {
          newRange = undefined;
          newDateFilter = undefined;
        }
        setFilter({
          ...filter,
          dateFilter: newDateFilter,
          createdTime: undefined,
          uploadedTime: undefined,
          sourceCreatedTime: newRange,
        });
        break;
      }
    }
  };
  const handleFirstDateChange = (date: moment.Moment | null) => {
    let range: DateRange | undefined;
    // set range according to Date Option
    switch (dateOption) {
      case DateOptions.before:
      default:
        range = date
          ? { max: getValidMaxDate(date).valueOf() }
          : { max: undefined };
        break;
      case DateOptions.after:
        range = date
          ? { min: getValidMinDate(date).valueOf() }
          : { min: undefined };
        break;
      case DateOptions.range:
        range = date
          ? { min: getValidMinDate(date).valueOf() }
          : { min: undefined };
        break;
    }
    setDateFilter(range, action);
  };
  const handleSecondDateChange = (date: moment.Moment | null) => {
    const range: DateRange | undefined = date
      ? { max: getValidMaxDate(date).valueOf() }
      : { max: undefined };
    setDateFilter(range, action);
  };

  // clear filter
  useEffect(() => {
    if (
      filter.createdTime === undefined &&
      filter.uploadedTime === undefined &&
      filter.sourceCreatedTime === undefined &&
      filter.dateFilter === undefined
    ) {
      setAction(DateActions.created);
      setDateOption(DateOptions.before);
    }
  }, [filter]);

  // if date is defined, use action and date option change to refetch
  useEffect(() => {
    if (filter.createdTime || filter.uploadedTime || filter.sourceCreatedTime) {
      setFilter({
        ...filter,
        dateFilter: { ...filter.dateFilter, action, dateOption },
      });
    }
  }, [action, dateOption]);

  return (
    <Container>
      <Title level={6}> Date </Title>

      <StyledSegmentedControl
        currentKey={filter.dateFilter?.action || DateActions.created}
        onButtonClicked={handleActionChange}
        size="small"
      >
        <SegmentedControl.Button key={DateActions.created}>
          {DateActions.created}
        </SegmentedControl.Button>
        <SegmentedControl.Button key={DateActions.uploaded}>
          {DateActions.uploaded}
        </SegmentedControl.Button>
        <SegmentedControl.Button key={DateActions.captured}>
          {DateActions.captured}
        </SegmentedControl.Button>
      </StyledSegmentedControl>

      <StyledSegmentedControl
        currentKey={filter.dateFilter?.dateOption || DateOptions.before}
        onButtonClicked={handleDateOptionChange}
        size="small"
        style={{ width: 'fit-content' }}
      >
        <SegmentedControl.Button key={DateOptions.before}>
          {DateOptions.before}
        </SegmentedControl.Button>
        <SegmentedControl.Button key={DateOptions.after}>
          {DateOptions.after}
        </SegmentedControl.Button>
        <SegmentedControl.Button key={DateOptions.range}>
          {DateOptions.range}
        </SegmentedControl.Button>
      </StyledSegmentedControl>

      <DatePickersContainer>
        <DatePicker
          value={getValue(filter, 1)}
          onChange={handleFirstDateChange}
          format={dateFormat}
          style={{ backgroundColor: '#ffffff' }}
        />
        <DatePicker
          value={getValue(filter, 2)}
          onChange={handleSecondDateChange}
          format={dateFormat}
          style={{ backgroundColor: '#ffffff' }}
          disabled={dateOption !== DateOptions.range}
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
