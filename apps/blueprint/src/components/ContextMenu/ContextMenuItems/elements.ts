import styled from 'styled-components';
import { Menu } from '@cognite/cogs.js';

export const ShapeStyleControlWrapper = styled.div`
  .ornate-stroke-style-menu {
    position: fixed;
    margin-top: -192px;
    flex-direction: column;
    justify-content: space-evenly;
    padding: 8px;
    border-radius: 4px;
    box-shadow: var(--cogs-z-6);
  }
`;

export const FontSizeControlWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 8px;

  .ornate-font-size-control {
    width: 50px;
  }

  input[type='number'] {
    appearance: auto;
  }

  input[type='number']::-webkit-inner-spin-button {
    cursor: pointer;
    appearance: inner-spin-button;
    opacity: 1;
  }
`;

export const DocumentNameWrapper = styled.div`
  margin: 0 8px;
  .cogs-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

export const DocumentNameSpan = styled.span`
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const AssetNameWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 24px;
  margin-left: 8px;
`;

export const DocumentsSelectorMenuWrapper = styled(Menu)`
  display: block;
  width: 320px;

  .documents-list {
    max-height: 316px;
    overflow-y: scroll;
  }

  .actions-area {
    display: flex;
    justify-content: space-between;

    .cogs-btn {
      margin: 8px 0px;
    }
  }
`;

export const ThicknessControlWrapper = styled.div`
  display: flex;
  padding-right: 8px;
`;

export const StyledImageColoroizer = styled.div`
  position: absolute;
  margin-top: -150px;
`;
