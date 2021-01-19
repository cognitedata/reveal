import { Colors } from '@cognite/cogs.js';
import React, { FC } from 'react';
import { Ref } from 'react-hook-form/dist/types/fields';
import styled from 'styled-components';

const SwitchLabel = styled((props) => (
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
  &.cogs-switch {
    input[type='checkbox'] {
      &:focus {
        + .switch-ui {
          outline: 1px solid ${Colors.primary.hex()};
        }
      }
    }
    &:hover {
      input[type='checkbox']:checked {
        &:disabled {
          + .switch-ui {
            cursor: not-allowed;
            background: ${Colors.primary.hex()};
          }
        }
      }
      input[type='checkbox'] {
        &:disabled {
          + .switch-ui {
            cursor: not-allowed;
            background: ${Colors['greyscale-grey5'].hex()};
          }
        }
        &:focus {
          + .switch-ui {
            outline: 1px solid ${Colors.primary.hex()};
          }
        }
      }
    }
  }
`;

export interface CheckboxWithRefProps {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultChecked: boolean | undefined;
  name: string;
  label?: string;
  disabled?: boolean;
  register?: (ref: Ref | null) => void;
}

export const SwitchWithRef: FC<CheckboxWithRefProps> = ({
  name,
  label,
  handleChange,
  register,
  defaultChecked,
  disabled = false,
  ...rest
}: CheckboxWithRefProps) => {
  return (
    <SwitchLabel className="cogs-switch" htmlFor={name}>
      {label}
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
      <div className="switch-ui" />
    </SwitchLabel>
  );
};
