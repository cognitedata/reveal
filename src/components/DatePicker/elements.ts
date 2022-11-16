import { Button, Colors } from '@cognite/cogs.js';
import { SpacedRow } from 'components/Common';
import styled, { css } from 'styled-components';

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

    .react-datepicker__month-container {
      width: 100%;
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
    .react-datepicker__day-names {
      display: flex;
      justify-content: space-around;
      margin: 0 9px;
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

export const DatePickerButtonWrapper = styled(Button)`
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

export const SpacedRowHeader = styled(SpacedRow)`
  justify-content: space-around;
`;

export const YearWrapper = styled.div`
  width: 80px;
`;

export const YearSelect = styled.select`
  width: 80px;
`;

export const MonthWrapper = styled.div`
  width: 130px;
`;

export const MonthSelect = styled.select`
  width: 130px;
`;

export const OptionStyle = styled.option`
  text-align: center;
`;

export const PivotRangePickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PivotRangeInput = styled.div`
  flex: 1;
`;

export const PivotRangeUnit = styled.div`
  flex: 1;
  display: block;
`;

export const PivotRangeDirection = styled.div`
  margin-bottom: 8px;
`;
