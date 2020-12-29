import React from 'react';
import { Select } from '@cognite/cogs.js';
import isEqual from 'lodash/isEqual';
import { CustomLabel, CustomSelectContainer } from 'components/modals/elements';
import { Board } from 'store/suites/types';
import { useForm } from 'hooks/useForm';
import { boardValidator } from 'validators';
import { TS_FIX_ME } from 'types/core';

interface Props {
  board: Board;
  setBoard: TS_FIX_ME;
}

const options = [
  { value: 'grafana', label: 'Grafana' },
  { value: 'powerbi', label: 'PowerBI' },
  { value: 'plotly', label: 'Plotly' },
  { value: 'spotfire', label: 'Spotfire' },
  { value: 'application', label: 'Application' },
  { value: 'other', label: 'Other' },
];

const BoardTypeSelector: React.FC<Props> = ({ board, setBoard }: Props) => {
  const { validateField, setErrors, errors } = useForm(boardValidator);
  const handleOnChange = (selectedOption: TS_FIX_ME) => {
    setBoard((prevState: Board) => ({
      ...prevState,
      type: selectedOption.value,
    }));
    setErrors((prevState: Board) => ({
      ...prevState,
      type: validateField('type', selectedOption.value),
    }));
  };

  const handleOnBlur = () => {
    setErrors((prevState: Board) => ({
      ...prevState,
      type: validateField('type', board.type || ''),
    }));
  };

  const boardTypeValue =
    options.find((option) => isEqual(option.value, board.type)) || null;

  return (
    <CustomSelectContainer selectError={errors?.type}>
      <CustomLabel>Select type</CustomLabel>
      <Select
        theme="grey"
        placeholder="Select type"
        name="type"
        value={boardTypeValue}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
        options={options}
        closeMenuOnSelect
      />
      {errors?.type && <span className="error-space">{errors?.type}</span>}
    </CustomSelectContainer>
  );
};

export default BoardTypeSelector;
