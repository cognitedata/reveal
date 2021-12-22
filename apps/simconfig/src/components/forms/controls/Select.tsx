import React from 'react';

import type { OptionType } from '@cognite/cogs.js';
import { Select as CogsSelect, Input } from '@cognite/cogs.js';

import { InputLabel, InputWithLabelContainer } from 'components/forms/elements';

interface Option {
  label: string | undefined;
  value: string;
}

interface ComponentProps {
  label: string;
  name: string;
  disabled: boolean;
  value: OptionType<string>;
  options: OptionType<string>[];
  onChange: (option: Option) => void;
}
function Select({
  disabled,
  value,
  name,
  label,
  options,
  onChange,
}: React.PropsWithoutRef<ComponentProps>) {
  if (disabled) {
    return (
      <Input
        name={name}
        title={label}
        type="string"
        value={value.label}
        disabled
      />
    );
  }
  return (
    <InputWithLabelContainer>
      <InputLabel>{label}</InputLabel>
      <CogsSelect
        disabled={disabled}
        isDisabled={disabled}
        name={name}
        options={options}
        value={value}
        closeMenuOnSelect
        fullWidth
        onChange={onChange}
      />
    </InputWithLabelContainer>
  );
}
export default Select;
