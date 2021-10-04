import { Input } from '@cognite/cogs.js';
import React, { FC, PropsWithChildren } from 'react';
import { Control, Controller, UseControllerProps } from 'react-hook-form';

export interface InputControllerProps
  extends Pick<UseControllerProps, 'name' | 'defaultValue'> {
  inputId: string;
  control: Control;
  disabled?: boolean;
}

export const InputController: FC<InputControllerProps> = ({
  name,
  inputId,
  control,
  defaultValue,
  disabled,
  ...rest
}: PropsWithChildren<InputControllerProps>) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <Input
          id={inputId}
          disabled={disabled}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e)}
          {...rest}
        />
      )}
    />
  );
};
