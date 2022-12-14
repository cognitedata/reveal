import { Label, Modal } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledLabel = styled(Label)`
  width: 89px;
  justify-content: center;
`;

export const StyledModal = styled(Modal)`
  border-radius: 12px;
  font-family: 'Inter';

  .cogs-modal-header {
    font-size: var(--cogs-t4-font-size);
    font-weight: 600;
    border: none;
    padding: 0 0 10px 0;
    border-bottom: 1px solid var(--cogs-border--muted);
  }

  .cogs-modal-content {
    padding: 12px 0;
    border-bottom: 1px solid var(--cogs-border--muted);
  }

  .cogs-modal-footer {
    border: none;
    padding: 18px 0 0 0;
  }
`;

export const InfoSpan = styled('span')`
  display: block;
  max-height: 500px;
  white-space: pre-line;
  overflow: auto;
`;
