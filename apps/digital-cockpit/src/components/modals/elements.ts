import styled from 'styled-components/macro';
import { SpaceBetween } from 'styles/common';

export const ModalContainer = styled.div`
  & .cogs-input-container,
  & .cogs-title-4 {
    margin-bottom: 16px;
  }
`;

export const SelectApplicationModalContainer = styled.div`
  display: grid;
  grid-template-columns: 20% 80%;
  height: 100%;
  overflow: auto;
  hr {
    border: 1px solid rgba(0, 0, 0, 0.15);
  }
  aside {
    width: 256px;
    button {
      width: 100%;
      display: block;
      outline: none;
      border: none;
      text-align: left;
      background: white;
      padding: 8px;
      &:hover {
        background: var(--cogs-bg-control--secondary);
        cursor: pointer;
      }
      &.active {
        background: #fafafa;
      }
    }
  }

  main {
    background: #fafafa;
    flex-grow: 1;
    height: 100%;
    padding: 24px;
  }

  .app-grid {
    display: grid;
    grid-template-columns: 33% 33% 33%;
    grid-gap: 16px;
  }
`;

export const AppDetailCard = styled.div<{ isFeatured: boolean }>`
  background: white;
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);
  width: 100%;
  margin: 0 16px 16px 0;
  display: flex;
  flex-direction: column;
  border: ${(props) =>
    props.isFeatured ? '1px solid var(--cogs-primary)' : 'none'};
  img {
    padding: 16px 16px 0;
  }
  header {
    display: flex;
    align-items: center;
    padding: 16px;
    .icon-container {
      margin-right: 8px;
    }
  }
  p {
    padding: 0 16px 16px;
  }

  footer {
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    padding: 0 16px 16px;
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

export const RadioItemsContainer = styled.div`
  & > h6 {
    padding-bottom: 8px;
  }
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  margin-bottom: 24px;
  padding-bottom: 12px;
  & > .cogs-radio {
    display: flex;
    margin-bottom: 5px;
  }
`;
