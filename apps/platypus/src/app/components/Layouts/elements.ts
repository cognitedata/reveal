import styled from 'styled-components/macro';

export const StyledPageContentLayout = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  flex-direction: column;

  .body {
    display: flex;
    flex: 1;
    overflow: auto;
    flex-direction: column;
    font-size: inherit;
    position: relative;
  }
`;

export const StyledPageLayout = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  flex: 1;
  overflow: auto;

  .page {
    flex: 1;
  }

  .content {
    flex: 1;
  }
`;

export const StyledPageWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-grow: 1;
  flex-direction: column;
  overflow: auto;
  height: 100%;
`;

export const SplitPanel = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: white;
  display: flex;

  .split-panel-sidebar {
    width: 25%;
    background: var(--split-panel-sidebar-background, transparent);
    top: 0;
    overflow-x: hidden;
    overflow-y: auto;
    bottom: 0;
    display: flex;
    box-sizing: border-box;
    resize: horizontal;
    height: 100%;
    flex-direction: column;
    position: relative;
  }

  .divider-hitbox {
    cursor: col-resize;
    align-self: stretch;
    display: flex;
    align-items: center;
    padding-right: 10px;
    z-index: 1;
  }

  .divider {
    height: 100%;
    border-right: 1px solid #ccc;
  }

  .split-panel-content {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    height: 100%;
    flex: 1;
    flex-direction: column;
    margin-left: -10px;
  }

  .split-panel-content-wrapper {
    display: block;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
`;
