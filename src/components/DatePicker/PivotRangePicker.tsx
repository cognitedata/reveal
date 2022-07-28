/* eslint-disable no-nested-ternary */
import React from 'react';
import dayjs from 'dayjs';
import { Body, Input, Select } from '@cognite/cogs.js';
import { SpacedRow } from 'components';
import ReactDatePicker from 'react-datepicker';
import {
  DatePickerInput,
  PivotRange,
  renderCustomHeader,
  DatePickerWrapper,
} from './Common';

const directions = [
  {
    label: 'before',
    value: 'before',
  },
  {
    label: 'after',
    value: 'after',
  },
  {
    label: 'before and after',
    value: 'both',
  },
];

export type PivotRangePickerProps = {
  range: PivotRange;
  onRangeChanged: (range: PivotRange) => void;
  units?: dayjs.OpUnitType[];
};

export const PivotRangePicker = ({
  range: { date, unit, amount, direction, type },
  onRangeChanged,
  units = ['minute', 'hour', 'day', 'week', 'month', 'year'],
}: PivotRangePickerProps) => {
  const options = units.map(key => ({
    value: key,
    label: amount > 1 ? `${key}s` : key,
  }));

  const onChange = (changes: Partial<PivotRange>) => {
    onRangeChanged({ date, unit, amount, direction, type, ...changes });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Body>Show me data from</Body>
      <SpacedRow style={{ marginBottom: 8, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <Input
            type="tel"
            variant="noBorder"
            value={amount}
            style={{ width: '100%' }}
            onChange={ev => {
              const { value } = ev.target;
              const number = +value;

              if (!Number.isNaN(number)) {
                onChange({ amount: value });
              }
            }}
            onBlur={() => {
              if (amount === '') onChange({ amount: 0 });
              else onChange({ amount: Number(amount) });
            }}
          />
        </div>
        <div style={{ flex: 1, display: 'block' }}>
          <Select
            value={options.find(el => el.value === unit)!}
            options={options}
            isSearchable={false}
            closeMenuOnSelect
            isMulti={false}
            onChange={(value: any) =>
              onChange({ unit: (value as { value: PivotRange['unit'] }).value })
            }
          />
        </div>
      </SpacedRow>
      <div style={{ marginBottom: 8 }}>
        <Select
          value={directions.find(el => el.value === direction)!}
          options={directions}
          isSearchable={false}
          closeMenuOnSelect
          isMulti={false}
          onChange={(value: any) =>
            onChange({
              direction: (value as { value: PivotRange['direction'] }).value,
            })
          }
        />
      </div>
      <DatePickerInput
        date={date}
        onDateChange={newDate => onChange({ date: newDate })}
      />
      <DatePickerWrapper mode={undefined} style={{ marginTop: 8 }}>
        <ReactDatePicker
          renderCustomHeader={renderCustomHeader()}
          selected={date}
          onChange={newDate => onChange({ date: newDate as Date })}
          inline
          disabledKeyboardNavigation
        />
      </DatePickerWrapper>
    </div>
  );
};
