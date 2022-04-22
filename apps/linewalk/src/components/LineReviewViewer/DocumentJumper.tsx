import React from 'react';
import { OptionType, Select } from '@cognite/cogs.js';
import { ValueType } from 'react-select';

type Props = {
  options: OptionType<string>[];
  onChange: (value: OptionType<string> | null) => void;
  value: OptionType<string>;
  inputValue: string;
  onInputChange: (value: string) => void;
};

const DocumentJumper: React.FC<Props> = ({
  options = [],
  onChange,
  inputValue,
  onInputChange,
  value,
}) => {
  return (
    <Select
      name="cars"
      className="cogs-select__control"
      style={{
        width: '500px',
      }}
      options={options}
      value={value}
      onChange={(option: ValueType<OptionType<string>, false>) =>
        onChange(option)
      }
      onInputChange={(nextInputValue: string) => onInputChange(nextInputValue)}
      inputValue={inputValue}
    />
  );
};

export default DocumentJumper;
