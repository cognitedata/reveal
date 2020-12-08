import styled from 'styled-components/macro';
import { Icon } from '@cognite/cogs.js';
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
  & > .cogs-btn-danger {
    background: var(--cogs-pink-6);
    color: var(--cogs-btn-color-danger);
  }
`;

export const ManageAccessModalFooter = styled(SpaceBetween)`
  margin-top: 24px;
`;

export const BoardsContainer = styled.div`
  width: 384px;
  padding-left: 40px;
  display: flex;
  flex-direction: column;
  & > :last-child {
    margin-top: auto;
  }
`;

export const AddedBoardItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 14px;

  &:hover {
    cursor: pointer;
    background-color: var(--cogs-greyscale-grey2);
    border-radius: 4px;
  }
  & > :last-child {
    margin-left: auto;
  }
`;

export const StyledCheckIcon = styled(Icon)`
  margin-right: 12px;
  color: var(--cogs-midblue-3);
`;

export const StyledDeleteIcon = styled(Icon)`
  color: var(--cogs-greyscale-grey6);
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 520px;
  padding-right: 36px;
  border-right: 1px solid var(--cogs-greyscale-grey5);
  & > :last-child {
    margin-left: auto;
  }
`;
