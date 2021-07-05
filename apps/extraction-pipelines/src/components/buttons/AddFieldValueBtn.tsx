import React, { PropsWithChildren } from 'react';
import { EditButton } from 'styles/StyledButton';
import { AddFieldInfoText } from 'components/message/AddFieldInfoText';

interface AddFieldValueBtnProps {
  onClick: () => void;
  canEdit: boolean;
}

export const AddFieldValueBtn = ({
  onClick,
  children,
  canEdit,
}: PropsWithChildren<AddFieldValueBtnProps>) => {
  return (
    <EditButton
      disabled={!canEdit}
      onClick={canEdit && onClick}
      $full
      $isBottom
    >
      <AddFieldInfoText>{children}</AddFieldInfoText>
    </EditButton>
  );
};
