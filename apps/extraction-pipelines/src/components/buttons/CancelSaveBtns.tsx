import React from 'react';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  button {
    margin: 0.2rem;
  }
`;

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
  return (
    <StyledButtonGroup>
      <Button
        variant="default"
        onClick={onCancel}
        data-testid={dateTestIdCancelBtn}
      >
        Cancel
      </Button>
      <Button type="primary" onClick={onSave} data-testid={dateTestIdSaveBtn}>
        Save
      </Button>
    </StyledButtonGroup>
  );
};
