import React, { PropsWithChildren } from 'react';
import { EditButton } from 'styles/StyledButton';
import { AddFieldInfoText } from 'components/message/AddFieldInfoText';

interface AddFieldValueBtnProps {
  onClick: () => void;
}

export const AddFieldValueBtn = ({
  onClick,
  children,
}: PropsWithChildren<AddFieldValueBtnProps>) => {
  return (
    <EditButton onClick={onClick} $full $isBottom>
      <AddFieldInfoText>{children}</AddFieldInfoText>
    </EditButton>
  );
};
