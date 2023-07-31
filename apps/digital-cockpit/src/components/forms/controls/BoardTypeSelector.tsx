import React from 'react';
import { Select } from '@cognite/cogs.js';
import isEqual from 'lodash/isEqual';
import { CustomLabel, CustomSelectContainer } from 'components/forms/elements';
import { Board, BoardType } from 'store/suites/types';
import { OptionTypeBase } from 'types/core';
import { ErrorMessage, FieldProps } from 'formik';

const options = [
  { value: 'grafana', label: 'Grafana' },
  { value: 'powerbi', label: 'PowerBI' },
  { value: 'plotly', label: 'Plotly' },
  { value: 'spotfire', label: 'Spotfire' },
  { value: 'other', label: 'Other' },
];

type Props = {
  boardType: BoardType | null;
};

const BoardTypeSelector: React.FC<Props & FieldProps<Board>> = ({
  field: { name, onBlur },
  form: {
    setFieldValue,
    setFieldTouched,
    errors: formErrors,
    touched: formTouched,
  },
  boardType,
}) => {
  const touched = formTouched[name];
  const error = formErrors[name];

  const handleChange = (selectedOption: OptionTypeBase) => {
    setFieldValue(name, selectedOption.value);
  };

  const handleBlur = (e: any) => {
    setFieldTouched(name, true);
    onBlur(e);
  };

  const boardTypeValue =
    options.find((option) => isEqual(option.value, boardType)) || [];

  return (
    <CustomSelectContainer selectError={!!(error && touched)}>
      <CustomLabel>Select type</CustomLabel>
      <Select
        theme="grey"
        placeholder="Select type"
        name={name}
        value={boardTypeValue}
        onBlur={handleBlur}
        onChange={handleChange}
        options={options}
        closeMenuOnSelect
      />
      <ErrorMessage name={name}>
        {(msg) => <span className="error-space">{msg}</span>}
      </ErrorMessage>
    </CustomSelectContainer>
  );
};

export default BoardTypeSelector;
