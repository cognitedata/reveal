import React, { FunctionComponent } from 'react';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import { DeepMap, FieldError } from 'react-hook-form';
import ValidationError from '../form/ValidationError';
import { InputWithRefProps, InputWithRef } from './InputWithRef';
import { InputWarningIcon } from '../icons/InputWarningIcon';

export const InputWarningError = styled((props) => (
  <div {...props}>{props.children}</div>
))`
  display: grid;
  grid-template-columns: 1fr 2.5rem;
  grid-template-rows: min-content 1rem;
  align-self: flex-end;
  grid-template-areas: 'input warning' 'error error';
  input {
    align-self: flex-end;
  }
  .cogs-icon-Warning {
    grid-area: warning;
    align-self: center;
    justify-self: center;
  }
  .error-message {
    grid-area: error;
  }
`;

interface OwnProps extends InputWithRefProps {
  isDirty: boolean;
  errors: DeepMap<Record<string, any>, FieldError>;
}

type Props = OwnProps;

const InputWithWarning: FunctionComponent<Props> = ({
  register,
  placeholder,
  defaultValue,
  handleChange,
  errors,
  isDirty,
  name,
  ...rest
}: OwnProps) => {
  return (
    <InputWarningError>
      <InputWithRef
        register={register}
        handleChange={handleChange}
        name={name}
        hasError={errors[name]}
        defaultValue={defaultValue}
        placeholder={placeholder}
        {...rest}
      />
      {isDirty && (
        <InputWarningIcon
          $color={Colors.warning.hex()}
          data-testid={`warning-icon-${name}`}
          className="waring"
        />
      )}
      <ValidationError errors={errors} name={name} />
    </InputWarningError>
  );
};

export default InputWithWarning;
