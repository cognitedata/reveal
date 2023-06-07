import styled from 'styled-components';

import { Modal } from '@cognite/cogs.js';

export const StyledModal = styled(Modal)`
  && {
    .cogs-modal-header {
      border-bottom: none;
      padding: 4px;
      height: auto;
    }
    .cogs-modal-footer {
      border-top: none;
      padding: 0;
    }
  }
`;
