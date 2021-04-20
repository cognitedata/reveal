import React, { FunctionComponent, PropsWithChildren } from 'react';
import {
  InputController,
  InputControllerProps,
} from 'components/inputs/InputController';
import ValidationError from 'components/form/ValidationError';
import { DivFlex } from 'styles/flex/StyledFlex';
import { DeepMap, FieldError } from 'react-hook-form';

interface InputErrorProps extends InputControllerProps {
  errors: DeepMap<Record<string, any>, FieldError>;
  labelText: string;
}

export const InputError: FunctionComponent<InputErrorProps> = ({
  name,
  inputId,
  control,
  defaultValue,
  errors,
  labelText,
}: PropsWithChildren<InputErrorProps>) => {
  return (
    <DivFlex direction="column" align="flex-start">
      <ValidationError errors={errors} name={name} id={`${name}-error`} />
      <InputController
        name={name}
        inputId={inputId}
        control={control}
        defaultValue={defaultValue}
        aria-invalid={!!errors[name]}
        aria-describedby={`${name}-hint ${name}-error`}
        aria-label={labelText}
      />
    </DivFlex>
  );
};
