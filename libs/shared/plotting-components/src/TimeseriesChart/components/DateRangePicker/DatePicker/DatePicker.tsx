/* eslint-disable no-nested-ternary */
import { useState, useRef, useMemo } from 'react';
import ReactDatePicker from 'react-datepicker';

import dayjs from 'dayjs';
import noop from 'lodash/noop';

import { Dropdown, Button } from '@cognite/cogs.js';

import { useTranslation } from '../../../../useTranslation';

import { DatePickerInput, renderCustomHeader } from './Common';
import { DatePickerWrapper } from './elements';

export type DatePickerProps = {
  initialDate?: Date;
  onDateChanged?: (date: Date) => void;
};

export const DatePicker = ({
  initialDate = new Date(),
  onDateChanged = noop,
}: DatePickerProps) => {
  // Cogs is stupid af so we have to ref the span
  const spanRef = useRef<HTMLSpanElement>(null);
  const { t } = useTranslation();

  const { offsetTop, offsetHeight } = spanRef?.current || {
    offsetTop: 0,
    offsetHeight: 0,
  };

  const maxHeight = useMemo(
    () => Math.max(window.innerHeight - offsetTop - offsetHeight - 100, 400),
    [offsetTop, offsetHeight]
  );

  const [date, setDate] = useState<Date>(initialDate);

  const renderModePicker = () => (
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
          renderCustomHeader={renderCustomHeader(t)}
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

  return (
    <Dropdown content={renderModePicker()} maxWidth="auto">
      <Button icon="Calendar">
        <span ref={spanRef}>{`${dayjs(initialDate).format(
          'YYYY/MM/DD HH:mm'
        )}`}</span>
      </Button>
    </Dropdown>
  );
};
