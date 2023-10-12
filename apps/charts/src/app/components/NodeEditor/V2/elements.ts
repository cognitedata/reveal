import styled from 'styled-components/macro';

import { Collapse, Button } from '@cognite/cogs.js';

import Layers from '../../../utils/z-index';

export const NodeEditorContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  flex-grow: 9;
  overflow-y: hidden;
  background: var(--cogs-greyscale-grey2);

  path.react-flow__edge-path {
    stroke-width: 2;
  }
`;
export const ContextMenu = styled.div`
  position: fixed;
  margin: 0;
  left: 0;
  top: 0;
  z-index: ${Layers.MINIMUM};
  --mouse-x: ${(props: { position: { x: number; y: number } }) =>
    props.position.x}px;
  --mouse-y: ${(props: { position: { x: number; y: number } }) =>
    props.position.y}px;
  transform: translateX(min(var(--mouse-x), calc(100vw - 100%)))
    translateY(min(var(--mouse-y), calc(100vh - 100%)));
`;

export const ScheduleToolbar = styled.div`
  position: absolute;
  top: 5px;
  right: 48px;
  z-index: ${Layers.MINIMUM};
  padding: 4px;
  background-color: var(--cogs-surface--muted);
  box-shadow: var(--cogs-z-8);
  border-radius: 6px;
`;

export const StyledCollapse = styled(Collapse)`
  &&& {
    .rc-collapse-item {
      .rc-collapse-header {
        border-bottom: none;
      }
      .rc-collapse-content-box {
        margin-top: 0;
      }
    }
  }
`;

export const DeleteSourceButton = styled(Button)`
  width: 28px;
  height: 28px;
  box-sizing: content-box;
  i {
    color: var(--cogs-text-icon--status-critical);
  }
  &&& {
    svg {
      width: 14px;
      height: 14px;
    }
    padding: 0;
  }
`;
