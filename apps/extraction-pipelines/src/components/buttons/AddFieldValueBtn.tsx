import React, { PropsWithChildren } from 'react';
import { EditButton } from 'components/styled';
import { AddFieldInfoText } from 'components/message/AddFieldInfoText';
import styled from 'styled-components';
import { useTranslation } from 'common';
import { Colors } from '@cognite/cogs.js';

interface AddFieldValueBtnProps {
  onClick: () => void;
  canEdit: boolean;
}

export const AddFieldValueBtn = ({
  onClick,
  children,
  canEdit,
}: PropsWithChildren<AddFieldValueBtnProps>) => {
  const { t } = useTranslation();

  return !canEdit ? (
    <NoDataAdded>{t('no-field-added', { field: children })}</NoDataAdded>
  ) : (
    <EditButton
      showPencilIcon={false}
      onClick={onClick}
      $full
      data-testid="add-field-btn"
    >
      <AddFieldInfoText>{children}</AddFieldInfoText>
    </EditButton>
  );
};

export const NoDataAdded = styled.div`
  color: ${Colors['greyscale-grey6'].hex()};
  padding: 0 1rem;
`;
