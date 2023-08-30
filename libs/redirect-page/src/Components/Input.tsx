import React from 'react';

import styled from 'styled-components';

import { BREAKPOINT_WIDTH } from '../common/constants';

import { Colors } from './Colors';

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: boolean;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoComplete?: string;
};

export const Input = (props: Props): JSX.Element => {
  const {
    value,
    placeholder,
    error,
    onChange,
    onKeyUp,
    style,
    id,
    name,
    autoComplete,
  } = props;

  return (
    <StyledInput
      type="text"
      autoFocus
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onKeyUp={onKeyUp}
      error={error}
      style={style}
      id={id}
      name={name}
      autoComplete={autoComplete}
    />
  );
};

const StyledInput = styled.input<Props>`
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding: 0 12px;
  border: ${({ error }) =>
    error
      ? `2px solid ${Colors.danger}`
      : `2px solid ${Colors['greyscale-grey4']}`};
  border-radius: 6px;
  caret-color: ${Colors.black};
  outline: none;
  font-family: inherit;

  &:hover {
    border: ${({ error }) =>
      error
        ? `2px solid ${Colors.danger}`
        : `2px solid ${Colors['midblue-4']}`};
    background: 'transparent';
    transition: border 180ms linear;
  }

  &:focus {
    border-color: ${({ error }) =>
      error ? Colors.danger : Colors['midblue-4']};
    background: ${Colors.white};
    box-shadow: ${({ error }) =>
      error
        ? `0 0 0 1px ${Colors.danger} inset;`
        : `0 0 0 1px ${Colors['midblue-4']} inset;`};
  }

  @media (max-width: ${BREAKPOINT_WIDTH}px) {
    font-size: 16px;
  }
`;
