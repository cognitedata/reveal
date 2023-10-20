import React, { FunctionComponent, useEffect, useState } from 'react';
import { OptionTypeBase } from 'react-select';

import styled from 'styled-components';

import { Button, Colors, Input, Range, Select } from '@cognite/cogs.js';

import { useTranslation } from '../../../common';
import {
  updateDateRangeAction,
  useRunFilterContext,
} from '../../../hooks/runs/RunsFilterContext';
import { DivFlex } from '../../styled';

import {
  createDateFromTimeChange,
  createHalfHourOptions,
  optionTimeField,
  parseTimeString,
  rangeToTwoDigitString,
} from './TimeSelectorUtils';

export type Time = { hours: number; min: number };

export const TimeSelector: FunctionComponent = () => {
  const { t } = useTranslation();
  const {
    state: { dateRange },
    dispatch,
  } = useRunFilterContext();
  const [showStartDropDown, setShowStartDropDown] = useState(false);
  const [showEndDropDown, setShowEndDropDown] = useState(false);
  const [startString, setStartString] = useState<string>(
    rangeToTwoDigitString({
      hours: dateRange.startDate?.getHours(),
      min: dateRange.startDate?.getMinutes(),
    })
  );
  const [endString, setEndString] = useState<string>(
    rangeToTwoDigitString({
      hours: dateRange.endDate?.getHours(),
      min: dateRange.endDate?.getMinutes(),
    })
  );
  useEffect(() => {
    setStartString(
      rangeToTwoDigitString({
        hours: dateRange.startDate?.getHours(),
        min: dateRange.startDate?.getMinutes(),
      })
    );
  }, [dateRange.startDate, setStartString]);
  useEffect(() => {
    setEndString(
      rangeToTwoDigitString({
        hours: dateRange.endDate?.getHours(),
        min: dateRange.endDate?.getMinutes(),
      })
    );
  }, [dateRange.endDate, setEndString]);
  const options = createHalfHourOptions();

  const handleSelectStart = ({ value }: OptionTypeBase) => {
    const { hours, min } = value;
    setStartString(rangeToTwoDigitString({ hours, min }));

    const start = createDateFromTimeChange(dateRange, 'startDate', value);
    dispatch(updateDateRangeAction({ ...dateRange, startDate: start }));
    setShowStartDropDown(false);
  };

  const handleSelectEnd = ({ value }: OptionTypeBase) => {
    const { hours, min } = value;
    setEndString(rangeToTwoDigitString({ hours, min }));

    const end = createDateFromTimeChange(dateRange, 'endDate', value);
    dispatch(updateDateRangeAction({ ...dateRange, endDate: end }));

    setShowEndDropDown(false);
  };

  const startInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setStartString(e.target.value);
    const time = parseTimeString(e.target.value);
    if (time) {
      const start = createDateFromTimeChange(dateRange, 'startDate', time);
      dispatch(updateDateRangeAction({ ...dateRange, startDate: start }));
    }
  };

  const endInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setEndString(e.target.value);
    const time = parseTimeString(e.target.value);
    if (time) {
      const end = createDateFromTimeChange(dateRange, 'endDate', time);
      dispatch(updateDateRangeAction({ ...dateRange, endDate: end }));
    }
  };

  const startSelectedValue = (range: Range) => {
    return options.filter(optionTimeField(range, 'startDate'))[0];
  };

  const endSelectedValue = (range: Range) => {
    return options.filter(optionTimeField(range, 'endDate'))[0];
  };

  const toggleStartDropDown = () => {
    setShowEndDropDown(false);
    setShowStartDropDown((prev) => !prev);
  };

  const toggleEndDropDown = () => {
    setShowStartDropDown(false);
    setShowEndDropDown((prev) => !prev);
  };

  return (
    <TimeWrapper className="time-picker" align="stretch">
      <DivFlex direction="column">
        <Input
          name="startTimeInput"
          value={startString}
          onChange={startInputChanged}
          onClick={toggleStartDropDown}
          postfix={
            <Button
              type="ghost"
              icon="ChevronDownSmall"
              onClick={toggleStartDropDown}
            />
          }
          aria-label={t('date-range-start-label')}
          data-testid="date-range-start-input"
        />
        <Select
          inputId="startTime"
          className="visually-hidden"
          menuIsOpen={showStartDropDown}
          value={startSelectedValue(dateRange)}
          options={options}
          onChange={handleSelectStart}
        />
      </DivFlex>
      <DivFlex direction="column">
        <Input
          name="endTimeInput"
          value={endString}
          onChange={endInputChanged}
          onClick={toggleEndDropDown}
          aria-label={t('date-range-end-label')}
          data-testid="date-range-end-input"
          size="large"
          postfix={
            <Button
              type="ghost"
              icon="ChevronDownSmall"
              onClick={toggleEndDropDown}
            />
          }
        />
        <Select
          inputId="endTime"
          className="visually-hidden"
          menuIsOpen={showEndDropDown}
          value={endSelectedValue(dateRange)}
          options={options}
          onChange={handleSelectEnd}
          onSelect
        />
      </DivFlex>
    </TimeWrapper>
  );
};

const TimeWrapper = styled(DivFlex)`
  .cogs-input-container {
    height: 100%;
    .cogs-input {
      width: 5rem;
      &:hover {
        background-color: transparent;
      }
    }
    .input__postfix--node {
      .cogs-btn {
        padding: 0.5rem;
        height: 100%;
        background-color: ${Colors['decorative--grayscale--white']};
        border-top: 1px solid ${Colors['decorative--grayscale--500']};
        border-right: 1px solid ${Colors['decorative--grayscale--500']};
        border-bottom: 1px solid ${Colors['decorative--grayscale--500']};
        &:hover {
          background-color: transparent;
        }
      }
    }
  }
  .cogs-select {
    width: 100%;
    height: 0;
    .cogs-select__control {
      display: none;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      height: 1px;
      overflow: hidden;
      position: static;
      white-space: nowrap;
      width: 1px;
    }
    .cogs-select__menu {
      position: absolute;
    }
  }
`;