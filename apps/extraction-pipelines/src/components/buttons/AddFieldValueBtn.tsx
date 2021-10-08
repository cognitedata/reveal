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
  if (!canEdit)
    return <div css="color: grey; padding: 0 1rem">No {children} added.</div>;
  return (
    <EditButton disabled={!canEdit} onClick={canEdit && onClick} $full>
      <AddFieldInfoText>{children}</AddFieldInfoText>
    </EditButton>
  );
};
