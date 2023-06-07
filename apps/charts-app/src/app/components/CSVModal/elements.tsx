/**
 * Elements for CSV Modal
 */

import { Icon, Input, Modal } from '@cognite/cogs.js';
import styled from 'styled-components';

export const ModalWrapper = styled(Modal)`
  max-width: 450px;
  .cogs-modal-header {
    border-bottom: none;
    font-size: var(--cogs-t3-font-size);
  }
`;

export const ExampleText = styled.p`
  font-size: 10px;
  color: #555;
`;

export const FullWidthInput = styled(Input)`
  width: 100%;
`;

export const Label = styled.label`
  font-weight: 500;
`;

export const FieldContainer = styled.div`
  margin-top: 20px;
`;

export const ButtonGroup = styled.div``;

export const BottomContainer = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StatusContainer = styled.div`
  display: flex;
  align-items: center; ;
`;

export const StatusText = styled.div`
  display: flex;
  align-items: center; ;
`;

export const StatusIcon = styled(Icon)`
  margin-right: 5px;
`;
