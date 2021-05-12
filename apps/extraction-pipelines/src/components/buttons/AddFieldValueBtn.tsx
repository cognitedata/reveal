import React, { PropsWithChildren } from 'react';
import { BluePlus, BlueText, EditButton } from 'styles/StyledButton';

interface AddFieldValueBtnProps {
  onClick: () => void;
}

export const AddFieldValueBtn = ({
  onClick,
  children,
}: PropsWithChildren<AddFieldValueBtnProps>) => {
  return (
    <EditButton onClick={onClick} $full $isBottom>
      <BluePlus />
      <BlueText>add {children}</BlueText>
    </EditButton>
  );
};
