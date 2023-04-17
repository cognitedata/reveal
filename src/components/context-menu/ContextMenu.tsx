import { Dispatch, RefObject, SetStateAction } from 'react';

import { Dropdown } from 'antd';
import { Edge, Node } from 'reactflow';
import styled from 'styled-components';
import { Z_INDEXES } from 'common';
import { ContextMenuItem } from './ContextMenuItem';
import { GroupNodes } from './GroupNodes';
import { Colors, Elevations } from '@cognite/cogs.js';

type WorkflowContextMenuPosition = {
  x: number;
  y: number;
};

type WorkflowNodeContextMenu = {
  type: 'node';
  items: Node[];
};

type WorkflowEdgeContextMenu = {
  type: 'edge';
  items: Edge[];
};

export type WorkflowContextMenu = {
  position: WorkflowContextMenuPosition;
} & (WorkflowEdgeContextMenu | WorkflowNodeContextMenu);

type ContextMenuProps = {
  containerRef: RefObject<HTMLDivElement>;
  contextMenu?: WorkflowContextMenu;
  onClose: () => void;
  setNodes: Dispatch<SetStateAction<Node[]>>;
};

const ContextMenu = ({
  containerRef,
  contextMenu,
  onClose,
  setNodes,
}: ContextMenuProps): JSX.Element => {
  const handleDelete = (): void => {};

  return (
    <Dropdown
      key={`${contextMenu?.position.x}-${contextMenu?.position.y}`}
      overlayStyle={{
        animationDuration: '0s',
      }}
      overlay={
        <DropdownContent
          onContextMenu={(e) => {
            e.preventDefault();
          }}
          onClick={onClose}
        >
          <ContextMenuItem
            label="Delete"
            onClick={handleDelete}
            shortcut="⌘+D"
          />
          <GroupNodes contextMenu={contextMenu} setNodes={setNodes} />
        </DropdownContent>
      }
      onOpenChange={(visible) => {
        if (!visible) {
          onClose();
        }
      }}
      getPopupContainer={() => containerRef.current as HTMLDivElement}
      open={!!contextMenu?.position}
      trigger={['click']}
      placement="bottomLeft"
    >
      <DropdownContainer
        $left={contextMenu?.position?.x}
        $top={contextMenu?.position?.y}
      >
        &nbsp;
      </DropdownContainer>
    </Dropdown>
  );
};

const DropdownContainer = styled.div<{ $left?: number; $top?: number }>`
  position: fixed;
  left: ${({ $left }) => $left}px;
  top: ${({ $top }) => $top}px;
  z-index: ${Z_INDEXES.WORKFLOW_CONTEXT_MENU};
  pointer-events: none;
  width: 4px;
  height: 4px;
`;

const DropdownContent = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--overlay']};
  display: flex;
  flex-direction: column;
  padding: 4px;
`;

export default ContextMenu;
