import React, { useContext } from 'react';
import { Group } from '@cognite/sdk';
import { Select } from '@cognite/cogs.js';
import includes from 'lodash/includes';
import { useDispatch, useSelector } from 'react-redux';
import { getGroupsState } from 'store/groups/selectors';
import { setBoardState } from 'store/forms/thunks';
import { RootDispatcher } from 'store/types';
import { boardState } from 'store/forms/selectors';
import { CustomLabel, CustomSelectContainer } from 'components/modals/elements';
import { Board } from 'store/suites/types';
import { OptionTypeBase } from 'types/core';
import { ADMIN_GROUP_NAME } from 'constants/cdf';
import { CdfClientContext } from 'providers/CdfClientProvider';

const exclude = [ADMIN_GROUP_NAME];

const GroupsSelector: React.FC = () => {
  const dispatch = useDispatch<RootDispatcher>();
  const { groups } = useSelector(getGroupsState);
  const board = useSelector(boardState) as Board;
  const client = useContext(CdfClientContext);

  const options = (groups || [])
    .filter((group: Group) => !includes(exclude, group.name))
    .map((group: Group) => ({ value: group.name, label: group.name }));

  const handleOnChange = (selectedOption: OptionTypeBase[]) => {
    dispatch(
      setBoardState(client, {
        ...board,
        visibleTo: (selectedOption || []).map((option) => option.value),
      })
    );
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
