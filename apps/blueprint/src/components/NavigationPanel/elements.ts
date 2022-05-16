import { ToolBar } from '@cognite/cogs.js';
import styled from 'styled-components';

export const InfoToolbar = styled(ToolBar)`
  position: absolute;
  bottom: 16px;
  right: 16px;
`;

export const InfoToolbarList = styled.div<{ $visible: boolean }>`
  position: absolute;
  left: 16px;
  top: 62px;
  height: 500px;
  background: white;
  width: 320px;
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  padding: 8px;
  display: ${(props) => (props.$visible ? 'flex' : 'none')};
  flex-direction: column;
  border-radius: 4px;

  header {
    padding: 8px;
  }

  footer {
    border-top: 1px solid var(--cogs-greyscale-grey3);
    padding: 16px 8px 8px;
    button {
      width: 100%;
    }
    .meta {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--cogs-text-secondary);
    }
  }

  .input-wrapper {
    width: 100%;
    padding: 8px;
    input {
      width: 100%;
    }
  }
  .rc-tabs {
    padding: 0 8px;
    overflow: visible;
    .rc-tabs-content {
      padding-top: 8px;
    }
  }
`;

export const InfoToolbarFile = styled.div`
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.08), 0px 1px 4px rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  .delete-btn {
    visibility: hidden;
    margin-left: auto;
  }
  &:hover {
    transform: scale(1.01);
    .delete-btn {
      visibility: visible;
    }
  }
`;
