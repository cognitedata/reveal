/* eslint-disable no-nested-ternary */
import React from 'react';
import { Select } from '@cognite/cogs.js';
import isEqual from 'lodash/isEqual';
import { SelectLabel, SelectContainer } from 'components/modals/elements';
import { Suite } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';

interface Props {
  suite: Suite;
  setSuite: TS_FIX_ME;
}

export const options = [
  { value: '#DBE1FE', label: 'Blue' },
  { value: '#F4DAF8', label: 'Pink' },
  { value: '#FFE1D1', label: 'Orange' },
  { value: '#FFF1CC', label: 'Yellow' },
  { value: '#C8F4E7', label: 'Green' },
  { value: '#91EBF5', label: 'Light blue' },
  { value: '#E8E8E8', label: 'Grey' },
];

const square = (color = '#ccc') => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: color,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 24,
    width: 24,
  },
});

const colourStyles = {
  control: (styles: any) => ({ ...styles, backgroundColor: '#fff' }),
  option: (styles: any, { data, isSelected }: any) => {
    return {
      ...styles,
      backgroundColor: isSelected ? data.color : null,
      color: '#000',
      ...square(data.value),
    };
  },
  input: (styles: any) => ({ ...styles, ...square() }),
  placeholder: (styles: any) => ({ ...styles, ...square() }),
  singleValue: (styles: any, { data }: any) => ({
    ...styles,
    ...square(data.value),
  }),
};

const ColorSelector: React.FC<Props> = ({ suite, setSuite }: Props) => {
  const handleOnChange = (selectedOption: TS_FIX_ME) => {
    setSuite((prevState: Suite) => ({
      ...prevState,
      color: selectedOption.value,
    }));
  };

  const suiteColorValue =
    options.find((option) => isEqual(option.value, suite.color)) || options[0];

  return (
    <SelectContainer>
      <SelectLabel>Select color</SelectLabel>
      <Select
        theme="grey"
        placeholder="Select type"
        name="type"
        value={suiteColorValue}
        onChange={handleOnChange}
        options={options}
        styles={colourStyles}
        maxMenuHeight={150}
        closeMenuOnSelect
      />
    </SelectContainer>
  );
};

export default ColorSelector;
