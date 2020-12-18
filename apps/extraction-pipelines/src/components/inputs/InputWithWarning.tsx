import React, { FunctionComponent } from 'react';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import { DeepMap, FieldError } from 'react-hook-form';
import { Ref } from 'react-hook-form/dist/types/fields';
import { InputWarningIcon } from './InputWarningIcon';
import ValidationError from '../form/ValidationError';
import { IntegrationFieldName } from '../../model/Integration';
import { User } from '../../model/User';

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
    align-self: flex-end;
    margin-bottom: 0.5rem;
  }
  .error-message {
    grid-area: error;
  }
`;

interface OwnProps {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  defaultValue: string | undefined;
  name: IntegrationFieldName | keyof User;
  isDirty: boolean;
  errors: DeepMap<Record<string, any>, FieldError>;
  register: (ref: Ref | null) => void;
}

type Props = OwnProps;

const InputWithWarning: FunctionComponent<Props> = ({
  register,
  placeholder,
  errors,
  isDirty,
  defaultValue,
  name,
  handleChange,
}: OwnProps) => {
  return (
    <InputWarningError>
      <input
        type="text"
        onChange={handleChange}
        id={name}
        name={name}
        placeholder={placeholder}
        className={`cogs-input full-width ${errors[name] && 'has-error'}`}
        ref={register}
        defaultValue={defaultValue}
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
