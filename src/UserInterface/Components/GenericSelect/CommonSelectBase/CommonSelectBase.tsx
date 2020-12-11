import React from 'react';
import styled from 'styled-components';
import { Select } from '@cognite/cogs.js';
import { ICommonSelectProps } from '@/UserInterface/Components/Settings/Types';

const CommonSelect = styled(Select)`
  display: flex;
  align-items: center;
  width: 100%;
`;

type CommonSelectBaseProps = ICommonSelectProps & {
  onChange?: (event: React.ChangeEvent<any>) => void;
};

export const CommonSelectBase = (props: CommonSelectBaseProps) => {
  const { options, value, onChange, disabled } = props;

  return (
    <CommonSelect
      fullWidth
      theme="filled"
      options={options}
      value={value}
      disabled={disabled}
      onChange={onChange}
    />
  );
};
