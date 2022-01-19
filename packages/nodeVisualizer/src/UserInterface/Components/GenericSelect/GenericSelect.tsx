import React from 'react';
import { UpDownSelect } from '@/UserInterface/Components/GenericSelect/UpDownSelect/UpDownSelect';
import { CommonSelectBase } from '@/UserInterface/Components/GenericSelect/CommonSelectBase/CommonSelectBase';
import { ICommonSelectProps } from '@/UserInterface/Components/Settings/Types';

interface GenericSelectProps extends ICommonSelectProps {
  node?: React.ReactElement<ICommonSelectProps, any>;
}

export const GenericSelect = (props: GenericSelectProps) => {
  const { options, extraOptionsData, value, onChange, disabled, node } = props;
  return (
    <UpDownSelect
      options={options}
      value={value}
      disabled={disabled}
      onChange={onChange}
      extraOptionsData={extraOptionsData}
      node={node || <CommonSelectBase />}
    />
  );
};
