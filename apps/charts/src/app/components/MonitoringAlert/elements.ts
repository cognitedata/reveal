import styled from 'styled-components';

import { Button, Col } from '@cognite/cogs.js';

export const AlertContainer = styled.div`
  font-weight: normal;
  margin-bottom: 5px;
`;

export const AlertText = styled(Col)`
  position: relative;
  top: 7px;
`;

export const AlertAction = styled(Button)<{ resolved?: boolean }>`
  &&& {
    height: 20px;
    position: relative;
    top: 7px;
    background: ${(props) =>
      props.resolved
        ? 'none'
        : 'var(--cogs-surface--status-warning--muted--default)'};
    border: 0;
    padding: 0;
    color: ${(props) =>
      props.resolved
        ? 'var(--cogs-text-icon--status-undefined)'
        : 'var(--cogs-text-icon--status-warning)'};
    padding: 0px 5px 0px 10px;
    i {
      margin-left: 3px;
    }
  }
`;

export const ModalBody = styled.div`
  &&& {
    margin: 1em 0em;
  }
`;
