import { RefObject } from 'react';

import { Colors, Detail } from '@cognite/cogs.js';
import { Dropdown, Menu } from 'antd';
import { Edge, Node } from 'reactflow';
import styled from 'styled-components';
import { Z_INDEXES } from 'common';

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
};

const ContextMenu = ({
  containerRef,
  contextMenu,
  onClose,
}: ContextMenuProps): JSX.Element => {
  const handleDelete = (): void => {};

  return (
    <Dropdown
      key={`${contextMenu?.position.x}-${contextMenu?.position.y}`}
      overlayStyle={{
        animationDuration: '0s',
      }}
      overlay={
        <div
          onContextMenu={(e) => {
            e.preventDefault();
          }}
        >
          <Menu>
            <Menu.Item key="delete" onClick={handleDelete}>
              <ContextMenuItem label="Delete" shortcut="⌘+D" />
            </Menu.Item>
          </Menu>
        </div>
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
      <DropdownContent
        $left={contextMenu?.position?.x}
        $top={contextMenu?.position?.y}
      >
        &nbsp;
      </DropdownContent>
    </Dropdown>
  );
};

const DropdownContent = styled.div<{ $left?: number; $top?: number }>`
  position: fixed;
  left: ${({ $left }) => $left}px;
  top: ${({ $top }) => $top}px;
  z-index: ${Z_INDEXES.WORKFLOW_CONTEXT_MENU};
  pointer-events: none;
  width: 4px;
  height: 4px;
`;

type ContextMenuItemProps = {
  disabled?: boolean;
  label: string;
  shortcut?: string;
};

const ContextMenuItem = ({ label, shortcut }: ContextMenuItemProps) => {
  return (
    <ContextMenuItemContent>
      <Detail>{label}</Detail>
      {shortcut && (
        <Detail
          style={{
            color: Colors['text-icon--muted'],
          }}
        >
          {shortcut}
        </Detail>
      )}
    </ContextMenuItemContent>
  );
};

const ContextMenuItemContent = styled.div`
  display: flex;
  gap: 32px;
  justify-content: space-between;
`;

export default ContextMenu;
