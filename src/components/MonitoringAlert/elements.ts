import { Button, Col } from '@cognite/cogs.js';
import styled from 'styled-components';

export const AlertContainer = styled.div`
  font-weight: normal;
  margin-bottom: 5px;
`;

export const AlertText = styled(Col)`
  position: relative;
  top: 7px;
`;

export const AlertAction = styled(Button)`
  &&& {
    background-color: var(--cogs-surface--status-warning--muted--default);
    border: 0;
    padding: 0;
    color: var(--cogs-text-icon--status-warning);
    padding: 0em 10px;
    i {
      margin-left: 5px;
    }
  }
`;

export const AlertActionTitle = styled.div`
  &&& {
    font-size: 80%;
    margin-bottom: 0.5em;
  }
`;

export const ModalBody = styled.div`
  &&& {
    margin: 1em 0em;
  }
`;
