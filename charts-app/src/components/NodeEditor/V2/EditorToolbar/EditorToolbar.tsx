/**
 * Node Editor Toolbar
 */

import { ReactNode } from 'react';
import styled from 'styled-components';
import Layers from 'utils/z-index';

type Props = {
  children: ReactNode;
};

const EditorToolbar = ({ children }: Props) => {
  return <ToolbarWrap>{children}</ToolbarWrap>;
};

const ToolbarWrap = styled.div`
  padding: 4px;
  border-radius: 6px;
  background-color: white;
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: ${Layers.MINIMUM};
  display: flex;
  box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);

  .toolbar-items {
    display: flex;
  }

  > span,
  > div {
    & + span,
    & + div {
      &::before {
        display: block;
        content: '';
        background: var(--cogs-border--muted);
        width: 2px;
        border-radius: 2px;
        margin: 6px 8px;
      }
    }
  }

  .react-flow__controls {
    box-shadow: none;
    border: 0;

    &--horizontal {
      position: relative;
      top: auto;
      left: auto;
      bottom: auto;
      flex-direction: row;
      flex: 1 1 auto;
      display: flex;

      .react-flow__controls-button {
        border: 0;
        border-radius: 6px;
        padding: 3px;
      }
    }
  }
`;

export default EditorToolbar;
