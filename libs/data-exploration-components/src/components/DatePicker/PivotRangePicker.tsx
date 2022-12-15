/* eslint-disable no-nested-ternary */
import React from 'react';
import dayjs from 'dayjs';
import { Body, Input } from '@cognite/cogs.js';
import { SpacedRow } from 'components';
import ReactDatePicker from 'react-datepicker';
import { DatePickerInput, PivotRange, renderCustomHeader } from './Common';
import {
  DatePickerWrapper,
  PivotRangeDirection,
  PivotRangeInput,
  PivotRangePickerWrapper,
  PivotRangeUnit,
} from './elements';

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
    <PivotRangePickerWrapper>
      <Body>Show me data from</Body>
      <SpacedRow style={{ marginBottom: 8, marginTop: 8 }}>
        <PivotRangeInput>
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
        </PivotRangeInput>
        <PivotRangeUnit>
          <select
            value={options.find(el => el.value === unit)?.value}
            onChange={value => {
              onChange({
                unit: (
                  options[value.target.selectedIndex] as {
                    value: PivotRange['unit'];
                  }
                ).value,
              });
            }}
            className="cogs-select__control"
          >
            {options.map(duration => (
              <option value={duration.value}>{duration.label}</option>
            ))}
          </select>
        </PivotRangeUnit>
      </SpacedRow>
      <PivotRangeDirection>
        <select
          value={directions.find(el => el.value === direction)?.value}
          onChange={value => {
            onChange({
              direction: (
                directions[value.target.selectedIndex] as {
                  value: PivotRange['direction'];
                }
              ).value,
            });
          }}
          className="cogs-select__control"
        >
          {directions.map(direction => (
            <option value={direction.value}>{direction.label}</option>
          ))}
        </select>
      </PivotRangeDirection>
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
    </PivotRangePickerWrapper>
  );
};
