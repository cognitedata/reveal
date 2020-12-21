import styled from 'styled-components/macro';
import { Icon, Body } from '@cognite/cogs.js';
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

export const ModalHeaderUnderline = styled.div<{ underlineColor?: string }>`
  height: 4px;
  width: 38px;
  background-color: ${({ underlineColor }) => underlineColor};
`;

export const ModalContent = styled.div`
  padding: 36px 0 0;
`;

export const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 48px;
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
  & .cogs-select__single-value {
    color: var(--cogs-black);
  }
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

export const Boards = styled.div`
  height: 268px;
  overflow-y: scroll;
`;

export const AddedBoardItem = styled.div<{ selected?: boolean }>`
  display: flex;
  width: 320px;
  align-items: center;
  padding: 0 4px 0 14px;
  background-color: ${({ selected }) =>
    selected ? 'var(--cogs-midblue-8)' : 'transparent'};
  border-radius: 4px;
  &:hover {
    cursor: pointer;
    background-color: var(--cogs-greyscale-grey2);
    & > :last-child {
      color: var(--cogs-greyscale-grey6);
    }
  }
  & > :last-child {
    margin-left: auto;
    color: transparent;
  }
  & > span {
    display: grid;
  }
`;

export const StyledCheckIcon = styled(Icon)`
  display: table;
  margin-right: 12px;
  color: var(--cogs-midblue-3);
`;

export const StyledTitle = styled.p<{ empty: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ empty }) =>
    empty ? 'var(--cogs-greyscale-grey5)' : 'var(--cogs-greyscale-grey9)'};
`;

export const StyledBody = styled(Body)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 520px;
  padding-right: 36px;
  border-right: 1px solid var(--cogs-greyscale-grey5);
`;

export const ActionButtonsContainer = styled.div`
  display flex;
  margin-left: auto;
  & > .cogs-btn {
    margin-left: 16px;
  }
  `;

export const Textarea = styled.textarea`
  font-style: normal;
  font-weight: 400;
  font-size: var(--cogs-font-size-sm);
  line-height: 20px;
  color: var(--cogs-greyscale-grey10);
  background: var(--cogs-greyscale-grey2);
  border: 1px solid var(--cogs-greyscale-grey2);
  width: 100%;
  resize: none;
  border-radius: 4px;
  outline: none;
  padding: 12px 16px;
  height: 96px;
  &:focus {
    border: 1px solid var(--cogs-midblue-4);
  }
  &:hover {
    border: 1px solid var(--cogs-midblue-4);
    background: var(--cogs-greyscale-grey2);
  }
`;
