import styled from 'styled-components/macro';
import { A, Icon, Body } from '@cognite/cogs.js';
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

export const CustomLabel = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  margin: 0 0 4px;
  & > span {
    margin-right: 8px;
  }
`;

export const CustomInputContainer = styled.div`
  & > .has-error {
    box-shadow: inset 0px -2px 0px 0px var(--cogs-danger);
  }
  & > .has-error:focus {
    border: 1px solid var(--cogs-greyscale-grey2);
  }
  & .has-error:hover {
    border-style: solid;
    border-color: var(--cogs-danger);
    border-width: 1px 1px 0 1px;
  }
  & .error-space {
    color: var(--cogs-danger);
  }
`;

export const CustomSelectContainer = styled.div<{ selectError?: boolean }>`
  margin-bottom: 16px;
  & .cogs-select__single-value {
    color: var(--cogs-black);
  }
  & .cogs-select {
    ${({ selectError }) =>
      selectError &&
      'box-shadow: inset 0px -2px 0px 0px var(--cogs-danger); border-bottom: 2px solid var(--cogs-danger);'};
  }
  & .cogs-select:hover {
    ${({ selectError }) => selectError && 'border-style: solid;'}
    border-color: var(--cogs-danger);
    ${({ selectError }) => selectError && 'border-width: 1px 1px 2px 1px;'};
  }
  & .error-space {
    color: var(--cogs-danger);
  }
`;

export const CustomTooltipContainer = styled.div`
  & > a {
    color: var(--cogs-white);
    text-decoration: underline;
  }
  & > a:hover {
    color: var(--cogs-white);
  }
`;

export const SnapshotInputContainer = styled.div`
  margin-bottom: 16px;
`;

export const ModalFooter = styled(SpaceBetween)`
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
  justify-content: space-between;
`;

export const Boards = styled.div`
  max-height: 324px;
  overflow-y: auto;
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

export const StyledLink = styled(A)`
  text-decoration: underline;
  & svg {
    width: 8px;
  }
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

export const ValidationContainer = styled.div<{ exceedWarningLength: boolean }>`
  display: flex;
  & > .error-space {
    font-size: 13px;
  }
  & > :last-child {
    color: var(--cogs-greyscale-grey7);
    margin-left: auto;
    ${({ exceedWarningLength }) => exceedWarningLength && 'font-weight: 700;'};
  }
`;

export const ShareURLInputContainer = styled.div`
  display: flex;
  padding-top: 8px;
  & > .cogs-btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    background-color: var(--cogs-greyscale-grey2);
  }
`;
export const ShareURLInput = styled.input`
  width: 100%;
  background-color: var(--cogs-greyscale-grey2);
  border: none;
  border-radius: 4px 0 0 4px;
  padding-left: 4px;
  padding-right: 4px;
  &:focus {
    outline: none;
  }
`;
