import styled from 'styled-components/macro';
import { Modal, Infobar } from '@cognite/cogs.js';

export const StyledModal = styled(Modal)`
  border-radius: 12px;
  font-family: 'Inter';
  padding: 0;

  .cogs-modal-header {
    padding: 22px 16px;
  }

  .cogs-modal-content {
    padding: 16px;

    .cogs-infobox {
      margin-bottom: 8px;

      .cogs-icon {
        display: none;
      }
    }
  }

  .cogs-modal-footer {
    display: none;
  }

  .cogs-modal-close {
    margin-top: 10px;
  }
`;

export const StyledInfobar = styled(Infobar)`
  .cogs-infobar__content {
    height: 40px;
  }
  .cogs-btn {
    margin-left: 16px;
  }
`;
