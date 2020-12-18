import React from 'react';
import { Select } from '@cognite/cogs.js';
import isEqual from 'lodash/isEqual';
import { SelectLabel, SelectContainer } from 'components/modals/elements';
import { Board } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';

interface Props {
  board: Board;
  setBoard: TS_FIX_ME;
}

const options = [
  { value: 'grafana', label: 'Grafana' },
  { value: 'powerbi', label: 'PowerBI' },
  { value: 'plotly', label: 'Plotly' },
  { value: 'application', label: 'Application' },
  { value: 'other', label: 'Other' },
];

const BoardTypeSelector: React.FC<Props> = ({ board, setBoard }: Props) => {
  const handleOnChange = (selectedOption: TS_FIX_ME) => {
    setBoard((prevState: Board) => ({
      ...prevState,
      type: selectedOption.value,
    }));
  };

  const boardTypeValue =
    options.find((option) => isEqual(option.value, board.type)) || null;

  return (
    <SelectContainer>
      <SelectLabel>Select type</SelectLabel>
      <Select
        theme="grey"
        placeholder="Select type"
        name="type"
        value={boardTypeValue || null}
        onChange={handleOnChange}
        options={options}
        closeMenuOnSelect
      />
    </SelectContainer>
  );
};

export default BoardTypeSelector;
