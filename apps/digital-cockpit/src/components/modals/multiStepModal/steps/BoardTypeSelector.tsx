import React, { useContext } from 'react';
import { Select } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { setBoardState } from 'store/forms/thunks';
import { boardState } from 'store/forms/selectors';
import isEqual from 'lodash/isEqual';
import { CustomLabel, CustomSelectContainer } from 'components/modals/elements';
import { Board } from 'store/suites/types';
import { ValidateFieldFunction } from 'hooks/useForm';
import { OptionTypeBase } from 'types/core';
import { RootDispatcher } from 'store/types';
import { CdfClientContext } from 'providers/CdfClientProvider';

const options = [
  { value: 'grafana', label: 'Grafana' },
  { value: 'powerbi', label: 'PowerBI' },
  { value: 'plotly', label: 'Plotly' },
  { value: 'spotfire', label: 'Spotfire' },
  { value: 'other', label: 'Other' },
];

type Props = {
  error: string;
  validate: ValidateFieldFunction;
  touched: boolean;
};

const BoardTypeSelector: React.FC<Props> = ({ error, validate, touched }) => {
  const board = useSelector(boardState) as Board;
  const dispatch = useDispatch<RootDispatcher>();
  const client = useContext(CdfClientContext);

  const handleOnChange = (selectedOption: OptionTypeBase) => {
    dispatch(
      setBoardState(client, {
        ...board,
        type: selectedOption.value,
      })
    );
    validate('type', selectedOption.value);
  };

  const handleOnBlur = () => {
    validate('type', board.type || '');
  };

  const boardTypeValue =
    options.find((option) => isEqual(option.value, board.type)) || [];
  return (
    <CustomSelectContainer selectError={!!(error && touched)}>
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
      {error && touched && <span className="error-space">{error}</span>}
    </CustomSelectContainer>
  );
};

export default BoardTypeSelector;
