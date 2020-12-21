import React from 'react';
import { Group } from '@cognite/sdk';
import { Select } from '@cognite/cogs.js';
import includes from 'lodash/includes';
import { useSelector } from 'react-redux';
import { getGroupsState } from 'store/groups/selectors';
import { SelectLabel, SelectContainer } from 'components/modals/elements';
import { Board } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';

interface Props {
  board: Board;
  setBoard: TS_FIX_ME;
}

const exclude = ['admin', 'default', 'dc-system-admin'];

const GroupsSelector: React.FC<Props> = ({ board, setBoard }: Props) => {
  const { allGroups } = useSelector(getGroupsState);

  // TODO(dtc-215) try to filter on middleware side
  const options = allGroups
    ?.filter((group: Group) => {
      return !includes(exclude, group.name);
    })
    .map((group: Group) => {
      return { value: group.name, label: group.name };
    });

  const handleOnChange = (selectedOption: TS_FIX_ME) => {
    setBoard((prevState: Board) => ({
      ...prevState,
      visibleTo: Array.isArray(selectedOption)
        ? selectedOption.map((option) => option.value)
        : [],
    }));
  };

  const groupsValue =
    options?.filter((obj) => board?.visibleTo?.includes(obj.value)) || null;

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
