import styled from 'styled-components/macro';
import z from 'utils/z';

export const WorkspaceContainer = styled.div`
  width: 100vw;
  height: 100vh;

  .workspace-toggle-button {
    position: fixed;
    top: 16px;
    left: 20px;
    z-index: ${z.OVERLAY};
    background: white;
    box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
      0px 3px 8px rgba(0, 0, 0, 0.06);
  }
`;

export const Elevation = styled.div`
  width: 300px;
  height: 128px;
  background: white;
  margin: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Content = styled.div`
  background: white;
  margin: 32px;
  display: flex;
  text-align: left;
  justify-content: left;
`;

export const Warning = styled.div`
  background-color: var(--cogs-danger);
  margin: 32px;
  width: 300px;
  padding: 20px;
  color: white;
`;

export const Loader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${z.MAXIMUM};
  right: 0;
  bottom: 0;
  text-align: center;
  vertical-align: middle;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  display: none;
  pointer-events: auto;

  &.visible {
    display: block;
  }

  .loading-icon {
    width: 40px;
    top: 50%;
    position: absolute;
  }
`;

export const MainToolbar = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
`;
export const ZoomButtonsToolbar = styled.div`
  position: fixed;
  bottom: 16px;
  left: 50%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 2px;
  height: 40px;
  background: #ffffff;
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);
  border-radius: 6px;
`;
