import { RefObject } from 'react';
import { Edge } from 'reactflow';

import styled from 'styled-components';

import { Z_INDEXES } from '@flows/common';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';
import { CanvasNode } from '@flows/types';
import { useUserInfo } from '@flows/utils/user';
import { Dropdown } from 'antd';

import { Colors, Elevations } from '@cognite/cogs.js';

import { ContextMenuItem } from './ContextMenuItem';
import { GroupNodes } from './GroupNodes';
import { UngroupNodes } from './UngroupNodes';

type WorkflowContextMenuPosition = {
  x: number;
  y: number;
};

type WorkflowNodeContextMenu = {
  type: 'node';
  items: CanvasNode[];
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
  const { data: userInfo } = useUserInfo();
  const { changeEdges, changeNodes } = useWorkflowBuilderContext();
  const handleDelete = (): void => {
    const { id } = contextMenu?.items[0] || {};
    if (id) {
      if (contextMenu?.type === 'edge') {
        changeEdges(
          (edges) => {
            const index = edges.findIndex((e) => e.id === id);
            if (index) {
              delete edges[index];
            }
          },
          () => ({
            time: Date.now(),
            message: JSON.stringify({
              message: 'Delete edge',
              user: userInfo?.displayName,
            }),
          })
        );
      } else if (contextMenu?.type === 'node') {
        changeNodes(
          (nodes) => {
            const index = nodes.findIndex((n) => n.id === id);
            if (index) {
              delete nodes[index];
            }
          },
          () => ({
            time: Date.now(),
            message: JSON.stringify({
              message: 'Delete node',
              user: userInfo?.displayName,
            }),
          })
        );
      }
    }
  };

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
          <GroupNodes contextMenu={contextMenu} />
          <UngroupNodes contextMenu={contextMenu} />
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
