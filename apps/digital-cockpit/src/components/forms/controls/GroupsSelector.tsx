import React from 'react';
import { Group } from '@cognite/sdk';
import { Select } from '@cognite/cogs.js';
import includes from 'lodash/includes';
import { useSelector } from 'react-redux';
import { getGroupsState } from 'store/groups/selectors';
import { CustomLabel, CustomSelectContainer } from 'components/forms/elements';
import { ADMIN_GROUP_NAME } from 'constants/cdf';
import { FieldProps } from 'formik';
import { OptionTypeBase } from 'types/core';

const exclude = [ADMIN_GROUP_NAME];

type Props = {
  visibleTo: string[] | undefined;
};

const GroupsSelector: React.FC<Props & FieldProps> = ({
  field: { name },
  form: { setFieldValue },
  visibleTo,
}) => {
  const { groups } = useSelector(getGroupsState);

  const options = (groups || [])
    .filter((group: Group) => !includes(exclude, group.name))
    .map((group: Group) => ({ value: group.name, label: group.name }));

  const groupsValue =
    options?.filter((obj) => visibleTo?.includes(obj.value)) || null;

  const handleChange = (selectedGroups: OptionTypeBase[]) => {
    setFieldValue(
      name,
      (selectedGroups || []).map((group) => group.value)
    );
  };

  return (
    <CustomSelectContainer>
      <CustomLabel>Manage access to board</CustomLabel>
      <Select
        theme="grey"
        placeholder="Type to search for groups"
        name={name}
        value={groupsValue}
        onChange={handleChange}
        options={options}
        maxMenuHeight={150}
        isMulti
        closeMenuOnSelect
      />
    </CustomSelectContainer>
  );
};

export default GroupsSelector;
