import React, { PropsWithChildren } from 'react';
import { BluePlus, BlueText, StyledEdit } from 'styles/StyledButton';

interface AddFieldValueBtnProps {
  onClick: () => void;
}

export const AddFieldValueBtn = ({
  onClick,
  children,
}: PropsWithChildren<AddFieldValueBtnProps>) => {
  return (
    <StyledEdit onClick={onClick} $full $isBottom>
      <BluePlus />
      <BlueText>add {children}</BlueText>
    </StyledEdit>
  );
};
