/* eslint-disable no-nested-ternary */
import React, { useMemo, useState, useRef } from 'react';

import styled from 'styled-components';

import dayjs from 'dayjs';
import noop from 'lodash/noop';

import {
  Dropdown,
  Button,
  Icon,
  ButtonProps,
  SegmentedControl,
  DateRange,
  Flex,
} from '@cognite/cogs.js';

import { TIME_SELECT } from '@data-exploration-lib/core';

import { Divider } from '../Common';

import {
  PivotRange,
  StartEndRange,
  determinePivotRange,
  getPivotRangeAsDates,
} from './Common';
import { PivotRangePicker } from './PivotRangePicker';

export type RangePickerProps = {
  initialRange?: [Date, Date];
  onRangeChanged?: (dates: [Date, Date]) => void;
  buttonProps?: ButtonProps;
  children?: React.ReactElement;
};

export const RangePicker = ({
  initialRange = TIME_SELECT['2Y'].getTime(),
  onRangeChanged = noop,
  buttonProps,
  children,
}: RangePickerProps) => {
  // Cogs is stupid af so we have to ref the span
  const spanRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<'range' | 'calendar'>('range');

  const [pivotRange, setPivotRange] = useState<PivotRange>(
    determinePivotRange(initialRange[0], initialRange[1])
  );
  const [startEndRange, setStartEndRange] = useState<StartEndRange>({
    type: 'StartEnd',
    startDate: initialRange[0],
    endDate: initialRange[1],
  });

  const { offsetTop, offsetHeight } = spanRef?.current || {
    offsetTop: 0,
    offsetHeight: 0,
  };

  const maxHeight = useMemo(
    () => Math.max(window.innerHeight - offsetTop - offsetHeight - 100, 300),
    [offsetTop, offsetHeight]
  );

  const onPivotRangeChange = (range: PivotRange) => {
    onRangeChanged(getPivotRangeAsDates(range));
    setPivotRange(range);
  };

  const renderModePicker = () => (
    <DateModePicker maxheight={maxHeight} direction="column" gap={8}>
      <SegmentedControl
        style={{ marginBottom: 8 }}
        currentKey={mode}
        fullWidth
        onButtonClicked={(key) => setMode(key as 'range' | 'calendar')}
      >
        <SegmentedControl.Button key="range" icon="Events">
          Range
        </SegmentedControl.Button>
        <SegmentedControl.Button key="calendar" icon="Calendar">
          Calendar
        </SegmentedControl.Button>
      </SegmentedControl>
      {mode === 'range' ? (
        <PivotRangePicker
          range={pivotRange}
          onRangeChanged={onPivotRangeChange}
        />
      ) : (
        <DateRange
          type="standard"
          calendarHasBorder={false}
          title="Select a range"
          showClose
          range={{
            startDate: startEndRange.startDate,
            endDate: startEndRange.endDate,
          }}
          onChange={({ startDate, endDate }) => {
            if (startDate && endDate) {
              onRangeChanged([startDate, endDate]);
              setStartEndRange((currentRange) => ({
                ...currentRange,
                startDate,
                endDate,
              }));
            }
          }}
        />
      )}
      <Divider.Horizontal />
    </DateModePicker>
  );

  return (
    <Dropdown content={renderModePicker()} maxWidth="auto">
      {children ? (
        children
      ) : (
        <Button icon="Calendar" {...buttonProps}>
          <span ref={spanRef}>{`${dayjs(initialRange[0]).format(
            'YYYY/MM/DD HH:mm'
          )}`}</span>
          <Icon
            type="ArrowRight"
            // style={{ marginLeft: 8, marginRight: 8 }}
          />
          <span>{`${dayjs(initialRange[1]).format('YYYY/MM/DD HH:mm')}`}</span>
        </Button>
      )}
    </Dropdown>
  );
};

interface DateModePickerProps {
  readonly maxheight: number;
}
const DateModePicker = styled(Flex)<DateModePickerProps>`
  border-radius: 8px;
  box-shadow: 0 0 16px lightgrey;
  padding: 16px;
  overflow: auto;
  background: white;
  width: 375px;
  max-height: ${(props) => props.maxheight}px;
`;
