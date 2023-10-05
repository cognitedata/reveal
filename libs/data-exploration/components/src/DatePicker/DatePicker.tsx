/* eslint-disable no-nested-ternary */
import React, { useState, useRef, useMemo } from 'react';
import ReactDatePicker from 'react-datepicker';

import noop from 'lodash/noop';

import { Dropdown, Button } from '@cognite/cogs.js';

import { formatDateToDatePickerString } from '@data-exploration-lib/core';

import { DatePickerInput, renderCustomHeader } from './Common';
import { DatePickerWrapper } from './elements';

export type DatePickerProps = {
  initialDate?: Date;
  onDateChanged?: (date: Date) => void;
};

const currentDate = new Date();
export const DatePicker = ({
  id,
  initialDate = currentDate,
  onDateChanged = noop,
}: DatePickerProps & { id?: string }) => {
  // Cogs is stupid af so we have to ref the span
  const spanRef = useRef<HTMLSpanElement>(null);

  const { offsetTop, offsetHeight } = spanRef?.current || {
    offsetTop: 0,
    offsetHeight: 0,
  };

  const maxHeight = useMemo(
    () => Math.max(window.innerHeight - offsetTop - offsetHeight - 100, 400),
    [offsetTop, offsetHeight]
  );

  return (
    <Dropdown
      content={
        <ModePicker
          initialDate={initialDate}
          onDateChanged={onDateChanged}
          maxHeight={maxHeight}
        />
      }
      maxWidth="auto"
    >
      <Button icon="Calendar" data-testid={id}>
        <span ref={spanRef}>{formatDateToDatePickerString(initialDate)}</span>
      </Button>
    </Dropdown>
  );
};

const ModePicker = ({
  initialDate,
  onDateChanged,
  maxHeight,
}: Required<DatePickerProps> & { maxHeight: number }) => {
  const [date, setDate] = useState<Date>(initialDate);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 16px lightgrey',
        padding: 16,
        background: '#fff',
        maxHeight,
        overflow: 'auto',
      }}
    >
      <DatePickerInput
        date={date}
        onDateChange={(newDate) => {
          onDateChanged(newDate);
          setDate(newDate);
        }}
      />
      <DatePickerWrapper mode={undefined} style={{ marginTop: 8 }}>
        <ReactDatePicker
          renderCustomHeader={renderCustomHeader()}
          selected={date}
          onChange={(newDate) => {
            const typedDate = newDate as Date;
            onDateChanged(typedDate);
            setDate(typedDate);
          }}
          disabledKeyboardNavigation
          inline
        />
      </DatePickerWrapper>
    </div>
  );
};
