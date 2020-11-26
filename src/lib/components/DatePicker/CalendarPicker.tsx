/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import moment from 'moment';
import ReactDatePicker from 'react-datepicker';
import { SpacedRow } from 'lib/components';
import { Button, Overline, Icon } from '@cognite/cogs.js';
import {
  DatePickerWrapper,
  DatePickerInput,
  renderCustomHeader,
} from './Common';

type CalendarPickerProps = {
  dates: [Date, Date];
  onDatesChanged?: (start: Date, end: Date) => void;
};

export const CalendarPicker = ({
  dates: [startDate, endDate],
  onDatesChanged = () => {},
}: CalendarPickerProps) => {
  const [editingDateMode, setEditingDateMode] = useState<'start' | 'end'>(
    'start'
  );

  const isYearDisabled = (currYear: number) => {
    if (editingDateMode === 'end') {
      return currYear < startDate.getFullYear();
    }
    return false;
  };
  const isMonthDisabled = (currYear: number, currMonth: number) => {
    if (editingDateMode === 'end') {
      if (currYear < startDate.getFullYear()) {
        return true;
      }
      if (currYear === startDate.getFullYear()) {
        return currMonth < startDate.getMonth();
      }
    }
    return false;
  };

  return (
    <DatePickerWrapper mode={editingDateMode}>
      <SpacedRow>
        <div style={{ display: 'block', marginBottom: 12 }}>
          <Overline level={3}>Start</Overline>
          <DatePickerInput
            type={editingDateMode === 'start' ? 'primary' : 'secondary'}
            onClick={() => setEditingDateMode('start')}
            date={startDate}
            onDateChange={value =>
              onDatesChanged(value, value > endDate ? value : endDate)
            }
          />
        </div>
        <Icon type="ArrowRight" />
        <div style={{ display: 'block' }}>
          <Overline level={3}>End</Overline>
          <DatePickerInput
            type={editingDateMode === 'end' ? 'primary' : 'secondary'}
            onClick={() => setEditingDateMode('end')}
            date={endDate}
            onDateChange={value => onDatesChanged(startDate, value)}
          />
        </div>
      </SpacedRow>
      <ReactDatePicker
        selected={editingDateMode === 'start' ? startDate : endDate}
        selectsStart={editingDateMode === 'start'}
        selectsEnd={editingDateMode === 'end'}
        onChange={newValue => {
          const date = newValue as Date;
          if (editingDateMode === 'start') {
            onDatesChanged(
              date as Date,
              date > endDate ? (date as Date) : endDate
            );
          } else {
            onDatesChanged(startDate, date);
          }
        }}
        renderCustomHeader={renderCustomHeader(isYearDisabled, isMonthDisabled)}
        startDate={startDate}
        endDate={endDate}
        dateFormat="yyyy-MM-dd hh:mm:ss"
        disabledKeyboardNavigation
        minDate={editingDateMode === 'end' ? startDate : undefined}
        maxDate={moment().toDate()}
        inline
      />
      <SpacedRow>
        {editingDateMode === 'start' ? (
          <>
            <div className="spacer" />
            <Button onClick={() => setEditingDateMode('end')}>
              Select End Date
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setEditingDateMode('start')}>
              Select Start Date
            </Button>
            <div className="spacer" />
          </>
        )}
      </SpacedRow>
    </DatePickerWrapper>
  );
};
