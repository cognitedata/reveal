import React, { FunctionComponent, PropsWithChildren } from 'react';
import { BluePlus, BlueText } from 'styles/StyledButton';

interface AddFieldInfoTextProps {}

export const AddFieldInfoText: FunctionComponent<AddFieldInfoTextProps> = ({
  children,
}: PropsWithChildren<AddFieldInfoTextProps>) => {
  return (
    <BlueText>
      <BluePlus /> add {children}
    </BlueText>
  );
};
