import { useEffect, useState } from 'react';
import * as React from 'react';
import styled from 'styled-components/macro';
import arrow from './arrow.svg';

interface TimeSelectorProps {
  value: Date;
  onChange: (value: Date) => void;
}

const pad = (value: number): string => {
  const valueString = `${value}`;
  return valueString.padStart(2, '0');
};

const getTime = (value: string): number[] => {
  const [hourString, minuteString] = value.split(':');
  if (
    hourString === undefined ||
    minuteString === undefined ||
    hourString.length !== 2 ||
    minuteString.length !== 2
  ) {
    return [];
  }
  const hours = Number(hourString);
  const minutes = Number(minuteString);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return [];
  }
  return [hours, minutes];
};

const minuteOptions = [0, 30];
const hourOptions = Array.from(Array(24).keys());

const timeOptions = hourOptions.flatMap((hourOption) =>
  minuteOptions.map((minuteOption) => `${pad(hourOption)}:${pad(minuteOption)}`)
);

const TimeSelector = ({ onChange, value }: TimeSelectorProps) => {
  const valueString = `${pad(value.getHours())}:${pad(value.getMinutes())}`;
  const [inputValue, setInputValue] = useState<string>(valueString);

  useEffect(() => {
    if (valueString !== inputValue) {
      setInputValue(valueString);
    }
    // Only needs to update when valueString changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueString]);

  const handleTimeChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const newValueString = e.target.value;
    setInputValue(newValueString);
    const [hours, minutes] = getTime(newValueString);
    if (hours === undefined || minutes === undefined) {
      return;
    }
    const newValue = new Date(value);
    newValue.setHours(hours);
    newValue.setMinutes(minutes);
    onChange(newValue);
  };

  const selectValue = timeOptions.includes(inputValue) ? inputValue : '';

  return (
    <div style={{ position: 'relative' }}>
      <Select onChange={handleTimeChange} value={selectValue}>
        <Option hidden />
        {timeOptions.map((time) => (
          <Option key={time}>{time}</Option>
        ))}
      </Select>
      <Input onChange={handleTimeChange} value={inputValue} />
    </div>
  );
};

const Select = styled.select`
  color: transparent;
  appearance: none;
  border: 0;
  background: transparent;
  padding: 10px 30px 10px 10px;
  border-radius: 4px;
  outline: 0;
  background: url(${arrow}) no-repeat;
  background-position: right 8px center;
  cursor: pointer;
  text-align: center;
  &:hover {
    background-color: rgba(0, 0, 0, 0.07);
  }
`;

const Option = styled.option`
  color: #3e484f;
`;

const Input = styled.input`
  width: 41px;
  border: none;
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 0;
  background: transparent;
  outline: none;
`;

export default TimeSelector;
