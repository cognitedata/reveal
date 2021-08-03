/* eslint-disable no-nested-ternary */
import React from 'react';
import { Select } from '@cognite/cogs.js';
import isEqual from 'lodash/isEqual';
import { CustomLabel } from 'components/forms/elements';
import { FieldProps } from 'formik';
import { OptionTypeBase } from 'types/core';

export const options = [
  { value: '#DBE1FE', label: 'Blue' },
  { value: '#F4DAF8', label: 'Pink' },
  { value: '#FFE1D1', label: 'Orange' },
  { value: '#FFF1CC', label: 'Yellow' },
  { value: '#C8F4E7', label: 'Green' },
  { value: '#D3F7FB', label: 'Light blue' },
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
  option: (styles: any, { data, isSelected }: any) => ({
    ...styles,
    backgroundColor: isSelected ? data.color : null,
    color: '#000',
    ...square(data.value),
  }),
  input: (styles: any) => ({ ...styles, ...square() }),
  placeholder: (styles: any) => ({ ...styles, ...square() }),
  singleValue: (styles: any, { data }: any) => ({
    ...styles,
    ...square(data.value),
  }),
};

type Props = {
  title: string;
};

const ColorSelector: React.FC<Props & FieldProps<string | undefined>> = ({
  title,
  field: { name, value, onBlur },
  form: { setFieldValue, setFieldTouched },
}) => {
  const suiteColorValue =
    options.find((option) => isEqual(option.value, value)) || options[0];

  const handleChange = (selectedOption: OptionTypeBase) => {
    setFieldValue(name, selectedOption.value || options[0].value);
  };

  const handleBlur = (e: any) => {
    setFieldTouched(name, true);
    onBlur(e);
  };

  return (
    <>
      <CustomLabel>{title}</CustomLabel>
      <Select
        theme="grey"
        placeholder={title}
        name={name}
        value={suiteColorValue}
        onChange={handleChange}
        onBlur={handleBlur}
        options={options}
        styles={colourStyles}
        maxMenuHeight={150}
        closeMenuOnSelect
      />
    </>
  );
};

export default ColorSelector;
