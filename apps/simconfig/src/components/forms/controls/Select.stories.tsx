import { useState } from 'react';

import { getSelectEntriesFromMap } from 'utils/formUtils';

import { InputRow } from '../elements';

import Select from './Select';

const component = {
  title: 'Select',
  component: Select,
  argTypes: {
    disabled: {
      type: 'boolean',
    },
    label: {
      type: 'string',
    },
  },
  args: {
    disabled: false,
    label: 'sample',
  },
};

export default component;

interface SelectStoryProps {
  disabled: boolean;
  label: string;
}

function SelectStory({ disabled, label }: SelectStoryProps) {
  const [value, setValue] = useState('min');
  enum SelectValues {
    Min = 'Min',
    Max = 'Max',
    Avg = 'Average',
  }
  return (
    <Select
      disabled={disabled}
      label={label}
      name="sample"
      options={getSelectEntriesFromMap(SelectValues)}
      value={{
        value,
        label: SelectValues[value as keyof typeof SelectValues],
      }}
      onChange={({ value }) => {
        setValue(value);
      }}
    />
  );
}

export function Base() {
  const [value, setValue] = useState('min');
  enum SelectValues {
    Min = 'Min',
    Max = 'Max',
    Avg = 'Average',
  }
  return (
    <InputRow>
      <Select
        label="Disabled Example"
        name="selectExample"
        options={getSelectEntriesFromMap(SelectValues)}
        value={{
          value,
          label: SelectValues[value as keyof typeof SelectValues],
        }}
        disabled
        onChange={({ value }) => {
          setValue(value);
        }}
      />

      <Select
        disabled={false}
        label="Select Example"
        name="selectExample"
        options={getSelectEntriesFromMap(SelectValues)}
        value={{
          value,
          label: SelectValues[value as keyof typeof SelectValues],
        }}
        onChange={({ value }) => {
          setValue(value);
        }}
      />
    </InputRow>
  );
}
export const Interactive = SelectStory.bind({});
