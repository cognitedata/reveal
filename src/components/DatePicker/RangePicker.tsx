/* eslint-disable no-nested-ternary */
import React, { useMemo, useState, useRef } from 'react';
import dayjs from 'dayjs';
import { SpacedRow, Divider } from 'components';
import {
  Dropdown,
  Button,
  Icon,
  ButtonProps,
  SegmentedControl,
} from '@cognite/cogs.js';
import { TIME_SELECT } from 'containers';
import { PivotRangePicker } from './PivotRangePicker';
import {
  PivotRange,
  StartEndRange,
  determinePivotRange,
  getPivotRangeAsDates,
} from './Common';
import { CalendarPicker } from './CalendarPicker';

export type RangePickerProps = {
  initialRange?: [Date, Date];
  onRangeChanged?: (dates: [Date, Date]) => void;
  buttonProps?: ButtonProps;
};

export const RangePicker = ({
  initialRange = TIME_SELECT['2Y'].getTime(),
  onRangeChanged = () => {},
  buttonProps,
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
      <SegmentedControl
        style={{ marginBottom: 8 }}
        currentKey={mode}
        fullWidth
        onButtonClicked={key => setMode(key as 'range' | 'calendar')}
      >
        <SegmentedControl.Button key="range" icon="Events">
          Range
        </SegmentedControl.Button>
        <SegmentedControl.Button key="calendar" icon="Calendar">
          Calendar
        </SegmentedControl.Button>
      </SegmentedControl>
      {mode === 'range' ? (
        <PivotRangePicker range={pivotRange} onRangeChanged={setPivotRange} />
      ) : (
        <CalendarPicker
          dates={[startEndRange.startDate, startEndRange.endDate]}
          onDatesChanged={(startDate, endDate) => {
            setStartEndRange(currentRange => ({
              ...currentRange,
              startDate,
              endDate,
            }));
          }}
        />
      )}
      <Divider.Horizontal />
      <SpacedRow>
        <div className="spacer" />
        <Button
          type="primary"
          variant="outline"
          onClick={() => {
            if (mode === 'range') {
              onRangeChanged(getPivotRangeAsDates(pivotRange));
            } else {
              onRangeChanged([startEndRange.startDate, startEndRange.endDate]);
            }
          }}
        >
          Update Range
        </Button>
      </SpacedRow>
    </div>
  );

  return (
    <Dropdown content={renderModePicker()} maxWidth="auto">
      <Button icon="Calendar" {...buttonProps}>
        <span ref={spanRef}>{`${dayjs(initialRange[0]).format(
          'YYYY/MM/DD HH:mm'
        )}`}</span>
        <Icon type="ArrowRight" style={{ marginLeft: 8, marginRight: 8 }} />
        <span>{`${dayjs(initialRange[1]).format('YYYY/MM/DD HH:mm')}`}</span>
      </Button>
    </Dropdown>
  );
};
