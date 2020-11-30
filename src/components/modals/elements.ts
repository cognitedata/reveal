import styled from 'styled-components/macro';
import { SpaceBetween } from 'styles/common';

export const ModalContainer = styled.div`
  & .cogs-input-container,
  & .cogs-title-4 {
    margin-bottom: 16px;
  }
`;

export const ModalCloseButton = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
`;

export const ModalHeaderUnderline = styled.div`
  height: 4px;
  width: 38px;
  background-color: var(--cogs-midblue-5);
`;

export const ModalContent = styled.div`
  padding: 24px 0 0;
`;

export const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 36px;
  & .cogs-btn {
    margin-left: 16px;
  }
`;

export const SelectLabel = styled.p`
  font-size: 13px;
  margin: 0 0 4px;
`;

export const SelectContainer = styled.div`
  margin-bottom: 16px;
`;

export const MultiStepModalFooter = styled(SpaceBetween)`
  margin-top: 48px;
  & div > .cogs-btn {
    margin-left: 16px;
  }
`;

export const DeleteModalFooter = styled(SpaceBetween)`
  margin-top: 24px;
`;

export const ManageAccessModalFooter = styled(SpaceBetween)`
  margin-top: 24px;
`;
