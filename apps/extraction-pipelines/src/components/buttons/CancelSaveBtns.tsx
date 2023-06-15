import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@extraction-pipelines/common';

import { Button } from '@cognite/cogs.js';
interface CancelSaveBtnsProps {
  onCancel: () => void;
  onSave: () => void;
  dateTestIdCancelBtn?: string;
  dateTestIdSaveBtn?: string;
}

export const CancelSaveBtns = ({
  onCancel,
  onSave,
  dateTestIdCancelBtn = 'cancel-btn',
  dateTestIdSaveBtn = 'save-btn',
}: CancelSaveBtnsProps) => {
  const { t } = useTranslation();
  return (
    <StyledButtonGroup>
      <Button onClick={onCancel} data-testid={dateTestIdCancelBtn}>
        {t('cancel')}
      </Button>
      <Button type="primary" onClick={onSave} data-testid={dateTestIdSaveBtn}>
        {t('save')}
      </Button>
    </StyledButtonGroup>
  );
};

export const StyledButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  button {
    margin: 0.2rem;
  }
`;
