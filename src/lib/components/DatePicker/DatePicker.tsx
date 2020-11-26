/* eslint-disable no-nested-ternary */
import React, { useState, useRef, useMemo } from 'react';
import moment from 'moment';
import { SpacedRow } from 'lib/components';
import { Dropdown, Button } from '@cognite/cogs.js';
import ReactDatePicker from 'react-datepicker';
import {
  DatePickerInput,
  DatePickerWrapper,
  renderCustomHeader,
} from './Common';

export type DatePickerProps = {
  initialDate?: Date;
  onDateChanged?: (date: Date) => void;
};

export const DatePicker = ({
  initialDate = new Date(),
  onDateChanged = () => {},
}: DatePickerProps) => {
  // Cogs is stupid af so we have to ref the span
  const spanRef = useRef<HTMLSpanElement>(null);

  const { offsetTop, offsetHeight } = spanRef?.current || {
    offsetTop: 0,
    offsetHeight: 0,
  };

  const maxHeight = useMemo(() => {
    return Math.max(window.innerHeight - offsetTop - offsetHeight - 100, 400);
  }, [offsetTop, offsetHeight]);

  const [date, setDate] = useState<Date>(initialDate);

  const renderModePicker = () => {
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
          onDateChange={newDate => setDate(newDate)}
        />
        <DatePickerWrapper mode={undefined} style={{ marginTop: 8 }}>
          <ReactDatePicker
            renderCustomHeader={renderCustomHeader()}
            selected={date}
            onChange={newDate => setDate(newDate as Date)}
            disabledKeyboardNavigation
            inline
          />
        </DatePickerWrapper>
        <SpacedRow>
          <div className="spacer" />
          <Button
            onClick={() => {
              onDateChanged(date);
            }}
          >
            Update Date
          </Button>
        </SpacedRow>
      </div>
    );
  };

  return (
    <Dropdown content={renderModePicker()} maxWidth="auto">
      <Button icon="Calendar">
        <span ref={spanRef}>{`${moment(initialDate).format(
          'yyyy/MM/DD HH:mm'
        )}`}</span>
      </Button>
    </Dropdown>
  );
};
