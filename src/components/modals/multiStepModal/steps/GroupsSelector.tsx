import React from 'react';
import { Group } from '@cognite/sdk';
import { Select } from '@cognite/cogs.js';
import includes from 'lodash/includes';
import { useSelector } from 'react-redux';
import { getGroupsState } from 'store/groups/selectors';
import { CustomLabel, CustomSelectContainer } from 'components/modals/elements';
import { Board } from 'store/suites/types';
import { useForm } from 'hooks/useForm';
import { boardValidator } from 'validators';
import { TS_FIX_ME } from 'types/core';
import { ADMIN_GROUP_NAME } from 'constants/cdf';

interface Props {
  board: Board;
  setBoard: TS_FIX_ME;
}

const exclude = [ADMIN_GROUP_NAME];

const GroupsSelector: React.FC<Props> = ({ board, setBoard }: Props) => {
  const { setErrors, validateField } = useForm(boardValidator);
  const { groups } = useSelector(getGroupsState);

  const options = (groups || [])
    .filter((group: Group) => {
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
    setErrors((prevState: Board) => ({
      ...prevState,
      visibleTo: validateField('visibleTo', ''),
    }));
  };

  const groupsValue =
    options?.filter((obj) => board?.visibleTo?.includes(obj.value)) || null;

  return (
    <CustomSelectContainer>
      <CustomLabel>Manage access to board</CustomLabel>
      <Select
        theme="grey"
        placeholder="Type to search for groups"
        name="visibleTo"
        value={groupsValue}
        onChange={handleOnChange}
        options={options}
        maxMenuHeight={150}
        isMulti
        closeMenuOnSelect
      />
    </CustomSelectContainer>
  );
};

export default GroupsSelector;
