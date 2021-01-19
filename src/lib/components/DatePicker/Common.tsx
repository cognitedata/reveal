import React from 'react';
import { Button, Colors, ButtonProps, Select } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
/* eslint-disable no-nested-ternary */
import moment from 'moment';

import { SpacedRow } from 'lib/components';

import range from 'lodash/range';

export type StartEndRange = {
  type: 'StartEnd';
  startDate: Date;
  endDate: Date;
};
export type PivotRange = {
  type: 'Pivot';
  date: Date;
  direction: 'before' | 'after' | 'both';
  amount: number;
  unit: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
};

export type DatePickerRange = StartEndRange | PivotRange;

export const determinePivotRange = (
  startDate: Date,
  endDate: Date
): PivotRange => {
  const startMoment = moment(startDate);
  const endMoment = moment(endDate);

  let amount = 0;
  let unit: PivotRange['unit'] = 'year';
  const units: PivotRange['unit'][] = [
    'year',
    'month',
    'week',
    'day',
    'hour',
    'minute',
  ];
  units.some(item => {
    amount = endMoment.diff(startMoment, item);
    unit = item;
    if (amount !== 0) {
      return true;
    }
    return false;
  });

  return {
    type: 'Pivot',
    date: endDate,
    direction: 'before',
    amount,
    unit,
  };
};

export const getPivotRangeAsDates = ({
  date,
  direction,
  amount,
  unit,
}: PivotRange): [Date, Date] => {
  switch (direction) {
    case 'before': {
      return [moment(date).subtract(amount, unit).toDate(), date];
    }
    case 'after': {
      return [date, moment(date).add(amount, unit).toDate()];
    }
  }
  return [
    moment(date).subtract(amount, unit).toDate(),
    moment(date).add(amount, unit).toDate(),
  ];
};

export const DatePickerInput = ({
  date,
  onDateChange,
  ...props
}: {
  date: Date;
  onDateChange: (date: Date) => void;
} & Omit<ButtonProps, 'ref'>) => {
  return (
    <ButtonWrapper icon="Calendar" variant="outline" {...props}>
      <ReactDatePicker
        open={false}
        dateFormat="yyyy-MM-dd HH:mm"
        onChange={value => onDateChange(value as Date)}
        selected={date}
        showTimeInput
      />
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled(Button)`
  input {
    background: none;
    box-shadow: none;
    border: none;
  }
  input:focus,
  input:hover,
  input:active {
    outline: none;
  }
`;

const years = range(
  moment(0).get('year'),
  moment().get('year') + 1,
  1
).reverse();
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const colourStyles = {
  option: (
    styles: React.CSSProperties,
    { isDisabled, isSelected }: { isDisabled: boolean; isSelected: boolean }
  ) => {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? Colors['midblue-6'].hex()
        : 'inherit',
      color: isDisabled ? '#ccc' : isSelected ? Colors.midblue.hex() : 'black',
      cursor: isDisabled ? 'not-allowed' : 'default',
    };
  },
};

type CalendarPickerProps = {
  dates: [Date, Date];
  onDatesChanged?: (start: Date, end: Date) => void;
};

export const renderCustomHeader = (
  isYearDisabled: (currYear: number) => boolean = () => false,
  isMonthDisabled: (currYear: number, currentMonth: number) => boolean = () =>
    false
): ReactDatePickerProps['renderCustomHeader'] =>
  (({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => {
    const year = moment(date).get('year');
    const month = moment(date).get('month');
    return (
      <SpacedRow style={{ paddingLeft: 8, paddingRight: 8 }}>
        <Button
          variant="ghost"
          size="small"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          icon="ArrowLeft"
        />
        <div className="spacer" />
        <div style={{ width: 80 }}>
          <Select
            value={{ label: year, value: year }}
            onChange={(value: any) => {
              changeYear((value as { value: number }).value);
            }}
            options={years.map(option => ({
              label: option,
              value: option,
              isDisabled: isYearDisabled(option),
            }))}
            isSearchable={false}
            closeMenuOnSelect
            isMulti={false}
            styles={colourStyles}
          />
        </div>
        <div style={{ width: 130 }}>
          <Select
            value={{ label: months[month], value: month }}
            onChange={(value: any) => {
              changeMonth((value as { value: number }).value);
            }}
            options={months.map((option, i) => ({
              label: option,
              value: i,
              isDisabled: isMonthDisabled(year, i),
            }))}
            isSearchable={false}
            closeMenuOnSelect
            isMulti={false}
            styles={colourStyles}
          />
        </div>
        <div className="spacer" />
        <Button
          variant="ghost"
          size="small"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          icon="ArrowRight"
        />
      </SpacedRow>
    );
  }) as ReactDatePickerProps['renderCustomHeader'];

export const DatePickerWrapper = styled.div<{
  mode: 'start' | 'end' | undefined;
}>(
  props => css`
    font-family: 'Inter';
    position: relative;

    && > * {
      width: 100%;
    }
    .cogs-select {
      width: 100%;
    }
    .react-datepicker {
      width: 100%;
      border: none;
      font-family: 'Inter';
      display: flex;
      flex-direction: column;
    }
    .react-datepicker__header {
      border-radius: 0px;
    }

    .react-datepicker__time-container {
      border: none;
      border-radius: 0px;
      height: 100%;
      flex: 1;
      align-self: stretch;
      display: flex;
      flex-direction: column;
      .react-datepicker__time-box {
        width: 100%;
      }
      li.react-datepicker__time-list-item--selected {
        background-color: ${Colors.midblue.hex()} !important;
      }
    }

    .react-datepicker__week {
      display: flex;
      flex-wrap: wrap;

      > * {
        flex: 1;
        line-height: normal;
        padding-top: 8px;
        padding-bottom: 8px;
      }
    }
    .react-datepicker__day--in-selecting-range {
      background-color: ${Colors['midblue-7'].hex()};
      color: ${Colors.midblue.hex()};
    }
    .react-datepicker__day--outside-month {
      color: ${Colors['greyscale-grey6'].hex()};
    }

    .react-datepicker__day--selected,
    .react-datepicker__day--in-range {
      background-color: ${Colors['midblue-6'].hex()};
      color: ${Colors.midblue.hex()};
      margin: 0px;
    }
    .react-datepicker__day--selected:hover,
    .react-datepicker__day--in-selecting-range:hover,
    .react-datepicker__day--in-range:hover {
      background-color: ${Colors['midblue-6'].hex()};
    }

    .react-datepicker__day--in-range.react-datepicker__day--outside-month {
      color: ${Colors['midblue-5'].hex()};
    }

    .react-datepicker__day {
      margin: 0px;
      border-radius: 0px;
    }

    .react-datepicker__day--range-start:not(.react-datepicker__day--in-selecting-range),
    .react-datepicker__day--selecting-range-start:not(.react-datepicker__day--in-range),
    .react-datepicker__day--range-start.react-datepicker__day--selecting-range-start {
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
    }
    .react-datepicker__day--range-end:not(.react-datepicker__day--in-selecting-range),
    .react-datepicker__day--selecting-range-end:not(.react-datepicker__day--in-range),
    .react-datepicker__day--range-end.react-datepicker__day--selecting-range-end {
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
    }
    .react-datepicker__day--selected.react-datepicker__day--range-start.react-datepicker__day--range-end.react-datepicker__day--in-range {
      background-color: ${Colors['midblue-5'].hex()};
      font-weight: 800;
    }
    ${props.mode === 'start' &&
    css`
      .react-datepicker__day--selecting-range-start {
        background-color: ${Colors['midblue-5'].hex()};
        font-weight: 800;
      }
    `}
    ${props.mode === 'end' &&
    css`
      .react-datepicker__day--selecting-range-end {
        background-color: ${Colors['midblue-5'].hex()};
        font-weight: 800;
      }
    `}
  `
);
