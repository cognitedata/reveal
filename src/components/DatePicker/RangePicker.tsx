/* eslint-disable no-nested-ternary */
import React, { useMemo, useState, useRef } from 'react';
import moment from 'moment';
import { SpacedRow, ButtonGroup, Divider } from 'components';
import { Dropdown, Button, Icon, ButtonProps } from '@cognite/cogs.js';
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
      <ButtonGroup
        style={{ marginBottom: 8 }}
        currentKey={mode}
        onButtonClicked={key => setMode(key as 'range' | 'calendar')}
      >
        <ButtonGroup.Button style={{ flex: 1 }} key="range" icon="Events">
          Range
        </ButtonGroup.Button>
        <ButtonGroup.Button style={{ flex: 1 }} key="calendar" icon="Calendar">
          Calendar
        </ButtonGroup.Button>
      </ButtonGroup>
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
        <span ref={spanRef}>{`${moment(initialRange[0]).format(
          'yyyy/MM/DD HH:mm'
        )}`}</span>
        <Icon type="ArrowRight" style={{ marginLeft: 8, marginRight: 8 }} />
        <span>{`${moment(initialRange[1]).format('yyyy/MM/DD HH:mm')}`}</span>
      </Button>
    </Dropdown>
  );
};
