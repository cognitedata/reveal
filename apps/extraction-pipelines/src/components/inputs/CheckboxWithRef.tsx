import React, { FC } from 'react';
import { Ref } from 'react-hook-form/dist/types/fields';
import styled from 'styled-components';

const CheckboxLabel = styled((props) => (
  <label {...props} htmlFor={props.htmlFor}>
    {props.children}
  </label>
))`
  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: static;
    white-space: nowrap;
    width: 1px;
  }
`;

export interface CheckboxWithRefProps {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultChecked: boolean | undefined;
  name: string;
  disabled: boolean;
  register: (ref: Ref | null) => void;
}

export const CheckboxWithRef: FC<CheckboxWithRefProps> = ({
  name,
  handleChange,
  register,
  defaultChecked,
  disabled,
  ...rest
}: CheckboxWithRefProps) => {
  return (
    <CheckboxLabel className="cogs-checkbox" htmlFor={name}>
      <input
        id={name}
        name={name}
        type="checkbox"
        className="visually-hidden"
        onChange={handleChange}
        disabled={disabled}
        ref={register}
        defaultChecked={defaultChecked}
        {...rest}
      />
      <div className="checkbox-ui" />
    </CheckboxLabel>
  );
};
