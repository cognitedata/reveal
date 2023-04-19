import { Dispatch, SetStateAction } from 'react';

import { Node } from 'reactflow';

import { GROUP_PADDING } from 'common';

import { ContextMenuItem } from './ContextMenuItem';
import { WorkflowContextMenu } from './ContextMenu';

type GroupNodesProps = {
  contextMenu?: WorkflowContextMenu;
  setNodes: Dispatch<SetStateAction<Node[]>>;
};

export const GroupNodes = ({
  contextMenu,
  setNodes,
}: GroupNodesProps): JSX.Element => {
  const handleGroup = (): void => {
    if (contextMenu?.items && contextMenu.type === 'node') {
      setNodes((prevNodes) => {
        const [minX, minY, maxX, maxY] = contextMenu.items.reduce(
          (acc, cur) => {
            return [
              Math.min(acc[0], cur.position.x),
              Math.min(acc[1], cur.position.y),
              Math.max(acc[2], cur.position.x + (cur.width ?? 0)),
              Math.max(acc[3], cur.position.y + (cur.height ?? 0)),
            ];
          },
          [
            Number.MAX_VALUE,
            Number.MAX_VALUE,
            Number.MIN_VALUE,
            Number.MIN_VALUE,
          ]
        );

        const rest = prevNodes.filter(({ id: testId }) =>
          contextMenu.items.every(
            ({ id: groupedNodeId }) => testId !== groupedNodeId
          )
        );
        const parentNode: Node = {
          id: `${new Date().getTime()}`, // TODO: generate uuid
          type: 'groupNode',
          position: { x: minX - GROUP_PADDING, y: minY - GROUP_PADDING },
          style: {
            width: maxX - minX + GROUP_PADDING * 2,
            height: maxY - minY + GROUP_PADDING * 2,
          },
          data: {},
        };

        return rest.concat(
          parentNode,
          contextMenu.items.map((item) => ({
            ...item,
            draggable: false,
            parentNode: parentNode.id,
            position: {
              x: item.position.x - minX + GROUP_PADDING,
              y: item.position.y - minY + GROUP_PADDING,
            },
          }))
        );
      });
    }
  };

  if (
    contextMenu?.type === 'node' &&
    contextMenu.items.length > 1 &&
    contextMenu.items.every(({ type }) => type !== 'groupNode')
  ) {
    return (
      <ContextMenuItem
        label="Group and lock"
        onClick={handleGroup}
        shortcut="⌘+G"
      />
    );
  }

  return <></>;
};
