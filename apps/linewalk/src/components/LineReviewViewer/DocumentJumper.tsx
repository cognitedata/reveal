import React from 'react';

type Option = {
  label: string;
  value: string;
};

type Props = {
  options?: Option[];
  onChange: (value: string) => void;
  value: string;
};

const DocumentJumper: React.FC<Props> = ({ options = [], onChange, value }) => {
  return (
    <select
      name="cars"
      className="cogs-select__control"
      style={{
        padding: '0 10px',
        width: '300px',
      }}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option
          value={option.value}
          key={option.value}
          selected={option.value === value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default DocumentJumper;
