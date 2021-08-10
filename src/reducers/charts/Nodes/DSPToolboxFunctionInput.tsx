import { useState, useCallback } from 'react';
import * as React from 'react';
import { Input } from '@cognite/cogs.js';

type Props = {
  defaultValue: any;
  onChange: (value: string) => void;
  id: string;
};

export const DSPToolboxFunctionInput = ({
  defaultValue,
  onChange,
  id,
}: Props) => {
  const [value, setValue] = useState<string>(defaultValue);
  const handleChange = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      setValue(target.value);
      onChange(target.value);
    },
    [onChange]
  );
  return <Input value={value} id={id} onChange={handleChange} />;
};
