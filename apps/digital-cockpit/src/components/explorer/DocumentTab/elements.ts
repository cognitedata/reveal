import { Modal } from '@cognite/cogs.js';
import styled from 'styled-components';

export const DocumentTabWrapper = styled.div`
  .search-input {
    .input-wrapper,
    input {
      width: 100%;
    }
  }

  > section {
    margin-bottom: 32px;
  }
  h3 {
    margin-bottom: 12px;
    margin-left: 2px;
  }
  .document-tab--sidebar {
    position: absolute;
    top: 48px;
    right: 0;
    background: white;
    height: calc(100% - 48px);
    border-left: 1px solid var(--cogs-greyscale-grey2);
  }
`;

export const DocumentModal = styled(Modal)`
  &.cogs-modal {
    height: 90vh;
    min-width: 90vw;

    .cogs-modal-content {
      overflow: hidden;
      height: calc(100% - 65px);
    }
  }
`;
