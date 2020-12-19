import React from 'react';
import { Select } from '@cognite/cogs.js';
import { SelectLabel, SelectContainer } from 'components/modals/elements';
import { Board } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';

interface Props {
  board: Board;
  setBoard: TS_FIX_ME;
}

const options = [
  { value: 'dc-user', label: 'User' },
  { value: 'dc-team-operations', label: 'Operations' },
  {
    value: 'dc-team-production-optimisation',
    label: 'Production optimization',
  },
  { value: 'dc-team-management', label: 'Management' },
  { value: 'dc-team-developers', label: 'Developers' },
];

const GroupsSelector: React.FC<Props> = ({ board, setBoard }: Props) => {
  const handleOnChange = (selectedOption: TS_FIX_ME) => {
    setBoard((prevState: Board) => ({
      ...prevState,
      visibleTo: Array.isArray(selectedOption)
        ? selectedOption.map((option) => option.value)
        : [],
    }));
  };

  const groupsValue =
    options.filter((obj) => board?.visibleTo?.includes(obj.value)) || null;

  return (
    <SelectContainer>
      <SelectLabel>Manage access to board</SelectLabel>
      <Select
        theme="grey"
        placeholder="Type to search for groups"
        name="type"
        value={groupsValue}
        onChange={handleOnChange}
        options={options}
        maxMenuHeight={150}
        isMulti
        closeMenuOnSelect
      />
    </SelectContainer>
  );
};

export default GroupsSelector;
