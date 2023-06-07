import styled from 'styled-components';

import { Modal } from '@cognite/cogs.js';

export const StyledModal = styled(Modal)`
  && {
    .cogs-modal-header {
      border-bottom: none;
    }
    .cogs-modal-footer {
      border-top: none;
      padding: 14px 16px;
    }
  }
`;
