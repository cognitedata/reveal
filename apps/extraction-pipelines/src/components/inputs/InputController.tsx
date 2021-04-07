import { Input } from '@cognite/cogs.js';
import React, { FC, PropsWithChildren } from 'react';
import {
  Controller,
  ControllerRenderProps,
  UseControllerOptions,
} from 'react-hook-form';

export interface InputControllerProps
  extends Pick<UseControllerOptions, 'name' | 'control' | 'defaultValue'> {
  inputId: string;
}

export const InputController: FC<InputControllerProps> = ({
  name,
  inputId,
  control,
  defaultValue,
  ...rest
}: PropsWithChildren<InputControllerProps>) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ onChange, value }: ControllerRenderProps) => (
        <Input id={inputId} value={value} onChange={onChange} {...rest} />
      )}
    />
  );
};
