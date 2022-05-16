import { Modal } from '@cognite/cogs.js';
import styled from 'styled-components';

export const FullScreenModalContainer = styled(Modal)`
  &.cogs-modal {
    height: 90vh;
    min-width: 90vw;
    .cogs-modal-content {
      height: calc(100% - 65px);
    }
  }
`;
