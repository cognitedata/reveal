import { Menu, Modal } from '@cognite/cogs.js';
import styled from 'styled-components';

export const GlobalSearchMenu = styled(Menu)`
  width: 550px;
  max-height: 400px;
  overflow-y: auto;
`;

export const ResourceTypeContainer = styled.div`
  display: flex;
  flex-direction: row;

  button {
    margin-right: 5px;

    .resource-type-selector--icon {
      background: none;
      margin-left: -4px;
    }
  }
`;

export const ResultContainer = styled.div`
  padding: 5px 10px;

  & > div {
    margin-top: 20px;
  }
`;

export const TimeSeriesModal = styled(Modal)`
  &.cogs-modal {
    height: 90vh;
    min-width: 90vw;

    .cogs-modal-content {
      height: calc(100% - 65px);
    }
  }
`;
