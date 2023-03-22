import { Button, Colors } from '@cognite/cogs.js';
import styled, { css } from 'styled-components';

export const SpacedRow = styled.div`
  display: flex;
  align-items: stretch;
  padding-bottom: 8px;

  & > * {
    margin-right: 6px;
    display: inline-flex;
  }
  .spacer {
    flex: 1;
  }
  & > *:nth-last-child(1) {
    margin-right: 0px;
  }
`;

export const DatePickerWrapper = styled.div<{
  mode: 'start' | 'end' | undefined;
}>(
  (props) => css`
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
        background-color: ${Colors['decorative--blue--100']} !important;
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
      background-color: ${Colors['decorative--blue--700']};
      color: ${Colors['decorative--blue--100']};
    }
    .react-datepicker__day--outside-month {
      color: ${Colors['decorative--grayscale--600']};
    }

    .react-datepicker__day--selected,
    .react-datepicker__day--in-range {
      background-color: ${Colors['decorative--blue--600']};
      color: ${Colors['decorative--blue--100']};
      margin: 0px;
    }
    .react-datepicker__day--selected:hover,
    .react-datepicker__day--in-selecting-range:hover,
    .react-datepicker__day--in-range:hover {
      background-color: ${Colors['decorative--blue--600']};
    }

    .react-datepicker__day--in-range.react-datepicker__day--outside-month {
      color: ${Colors['decorative--blue--500']};
    }

    .react-datepicker__day {
      margin: 0px;
      border-radius: 0px;
    }

    .react-datepicker__day--range-start:not(
        .react-datepicker__day--in-selecting-range
      ),
    .react-datepicker__day--selecting-range-start:not(
        .react-datepicker__day--in-range
      ),
    .react-datepicker__day--range-start.react-datepicker__day--selecting-range-start {
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
    }
    .react-datepicker__day--range-end:not(
        .react-datepicker__day--in-selecting-range
      ),
    .react-datepicker__day--selecting-range-end:not(
        .react-datepicker__day--in-range
      ),
    .react-datepicker__day--range-end.react-datepicker__day--selecting-range-end {
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
    }
    .react-datepicker__day--selected.react-datepicker__day--range-start.react-datepicker__day--range-end.react-datepicker__day--in-range {
      background-color: ${Colors['decorative--blue--500']};
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
        background-color: ${Colors['decorative--blue--500']};
        font-weight: 800;
      }
    `}
    ${props.mode === 'end' &&
    css`
      .react-datepicker__day--selecting-range-end {
        background-color: ${Colors['decorative--blue--500']};
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

export const lightGrey = Colors['border--muted'];

const HorizontalDivider = styled.div`
  width: 100%;
  height: 2px;
  margin-top: 8px;
  margin-bottom: 8px;
  background: ${lightGrey};
  display: inline-table;
`;

const VerticalDivider = styled.div`
  height: 100%;
  height: 2px;
  margin-left: 8px;
  margin-right: 8px;
  background: ${lightGrey};
  display: inline-table;
`;

export const Divider = {
  Vertical: VerticalDivider,
  Horizontal: HorizontalDivider,
};
