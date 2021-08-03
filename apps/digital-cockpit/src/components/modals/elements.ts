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
  & > button {
    padding: 10px;
  }
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

export const ShareURLInputContainer = styled.div`
  display: flex;
  padding-top: 10px;
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

export const UploadLogoContainer = styled.div`
  margin-bottom: 10px;
`;

export const SwitchContainer = styled.div`
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  .cogs-title-5 {
    margin-bottom: 16px;
  }
  .cogs-switch {
    margin: 8px 16px;
  }
`;
