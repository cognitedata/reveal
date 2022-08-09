import React, { PropsWithChildren } from 'react';
import { EditButton } from 'components/styled';
import { AddFieldInfoText } from 'components/message/AddFieldInfoText';
import { greyscaleGrey } from 'components/navigation/breadcrumbs/Breadcrumbs';
import styled from 'styled-components';

interface AddFieldValueBtnProps {
  onClick: () => void;
  canEdit: boolean;
}

export const NoDataAdded = styled.div`
  color: ${greyscaleGrey(6)};
  padding: 0 1rem;
`;

export const AddFieldValueBtn = ({
  onClick,
  children,
  canEdit,
}: PropsWithChildren<AddFieldValueBtnProps>) => {
  return !canEdit ? (
    <NoDataAdded>No {children} added.</NoDataAdded>
  ) : (
    <EditButton showPencilIcon={false} onClick={onClick} $full>
      <AddFieldInfoText>{children}</AddFieldInfoText>
    </EditButton>
  );
};
