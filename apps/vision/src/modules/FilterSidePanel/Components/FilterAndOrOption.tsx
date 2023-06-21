import { Radio } from 'antd';
import { Detail } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const FilterAndOrOption = ({
  option,
  onOptionChange,
}: {
  onOptionChange?: (option: 'any' | 'all') => void;
  option?: 'any' | 'all' | '';
}) => {
  return (
    <RadioContainer>
      <Radio
        name="any"
        value="any"
        checked={option === 'any'}
        onChange={
          onOptionChange ? (evt) => onOptionChange(evt.target.value) : () => {}
        }
        key="any"
      >
        {' '}
        <Detail>Or</Detail>
      </Radio>
      <Radio
        name="all"
        value="all"
        checked={option === 'all'}
        onChange={
          onOptionChange ? (evt) => onOptionChange(evt.target.value) : () => {}
        }
        key="all"
      >
        {' '}
        <Detail>And</Detail>
      </Radio>
    </RadioContainer>
  );
};

const RadioContainer = styled.div`
  display: flex;
  gap: 20px;
`;
