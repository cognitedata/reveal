import { useEffect, useState } from 'react';
import * as React from 'react';
import styled from 'styled-components/macro';

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

const arrowSVGBase64 = `base64,PHN2ZyB3aWR0aD0nOXB4JyBoZWlnaHQ9JzZweCcgdmlld0JveD0nMCAwIDkgNicgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJz48ZyBpZD0nQXJ0Ym9hcmQnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLXdpZHRoPScxJyBmaWxsPScjM2U0ODRmJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnIHRyYW5zZm9ybT0ndHJhbnNsYXRlKC02MzYuMDAwMDAwLCAtMTcxLjAwMDAwMCknIGZpbGwtb3BhY2l0eT0nMC4zNjg3MTYwMzMnPjxnIGlkPSdpbnB1dCcgdHJhbnNmb3JtPSd0cmFuc2xhdGUoMTcyLjAwMDAwMCwgMzcuMDAwMDAwKScgZmlsbD0nJTIzMEUyNDJGJyBmaWxsLXJ1bGU9J25vbnplcm8nPjxnIGlkPSdHcm91cC05JyB0cmFuc2Zvcm09J3RyYW5zbGF0ZSgzMjMuMDAwMDAwLCAxMjcuMDAwMDAwKSc+PHBhdGggZD0nTTE0Mi4yODAyNDUsNy4yMzk1MjgxMyBDMTQxLjk4NzMwNSw2LjkyMzUzNDcyIDE0MS41MTI0MzIsNi45MjM2MTY2MiAxNDEuMjE5NTg1LDcuMjM5NzExMDYgQzE0MC45MjY3MzksNy41NTU4MDU1IDE0MC45MjY4MTUsOC4wNjgyMTM5NCAxNDEuMjE5NzU1LDguMzg0MjA3MzUgTDE0NS40OTg4MDEsMTMgTDE0OS43ODAyNDUsOC4zODE2MjA3MSBDMTUwLjA3MzE4NSw4LjA2NTYyNzMgMTUwLjA3MzI2MSw3LjU1MzIxODg2IDE0OS43ODA0MTUsNy4yMzcxMjQ0MiBDMTQ5LjQ4NzU2OCw2LjkyMTAyOTk4IDE0OS4wMTI2OTUsNi45MjA5NDgwOCAxNDguNzE5NzU1LDcuMjM2OTQxNDkgTDE0NS40OTg4MDEsMTAuNzExMzczMiBMMTQyLjI4MDI0NSw3LjIzOTUyODEzIFonIGlkPSdhcnJvdyc+PC9wYXRoPjwvZz48L2c+PC9nPjwvc3ZnPgo=`;

const Select = styled.select`
  && {
    color: transparent;
    appearance: none;
    border: 0;
    background: transparent;
    padding: 10px 30px 10px 10px;
    border-radius: 4px;
    outline: 0;
    background: url('data:image/svg+xml;${arrowSVGBase64}') no-repeat;
    background-position: right 8px center;
    cursor: pointer;
    text-align: center;
    &:hover {
      background-color: rgba(0, 0, 0, 0.07);
    }
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
