import React from 'react';
import { Select } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { setBoard } from 'store/forms/actions';
import { boardState } from 'store/forms/selectors';
import isEqual from 'lodash/isEqual';
import { CustomLabel, CustomSelectContainer } from 'components/modals/elements';
import { Board } from 'store/suites/types';
import { useForm } from 'hooks/useForm';
import { boardValidator } from 'validators';
import { TS_FIX_ME } from 'types/core';
import { RootDispatcher } from 'store/types';

const options = [
  { value: 'grafana', label: 'Grafana' },
  { value: 'powerbi', label: 'PowerBI' },
  { value: 'plotly', label: 'Plotly' },
  { value: 'spotfire', label: 'Spotfire' },
  { value: 'application', label: 'Application' },
  { value: 'infographics', label: 'Infographics' },
  { value: 'other', label: 'Other' },
];

const BoardTypeSelector: React.FC = () => {
  const { validateField, setErrors, errors } = useForm(boardValidator);
  const board = useSelector(boardState) as Board;
  const dispatch = useDispatch<RootDispatcher>();

  const handleOnChange = (selectedOption: TS_FIX_ME) => {
    dispatch(
      setBoard({
        ...board,
        type: selectedOption.value,
      })
    );
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
