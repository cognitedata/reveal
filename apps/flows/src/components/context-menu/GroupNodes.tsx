import { uuid } from '@automerge/automerge';
import { DEFAULT_GROUP_NAME, GROUP_PADDING } from '@flows/common';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';
import { CanvasNode } from '@flows/types';

import { WorkflowContextMenu } from './ContextMenu';
import { ContextMenuItem } from './ContextMenuItem';

type GroupNodesProps = {
  contextMenu?: WorkflowContextMenu;
};

export const GroupNodes = ({ contextMenu }: GroupNodesProps): JSX.Element => {
  const { changeNodes } = useWorkflowBuilderContext();

  const handleGroup = (): void => {
    if (contextMenu?.items && contextMenu.type === 'node') {
      changeNodes((nodes) => {
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

        const parentNode: CanvasNode = {
          id: uuid(),
          type: 'parent',
          position: { x: minX - GROUP_PADDING, y: minY - GROUP_PADDING },
          style: {
            width: maxX - minX + GROUP_PADDING * 2,
            height: maxY - minY + GROUP_PADDING * 2,
          },
          data: {
            label: DEFAULT_GROUP_NAME,
          },
        };

        contextMenu.items.forEach((item) => {
          const node = nodes.find((node) => node.id === item.id);
          if (node) {
            node.draggable = false;
            node.parentNode = parentNode.id;
            node.position = {
              x: item.position.x - minX + GROUP_PADDING,
              y: item.position.y - minY + GROUP_PADDING,
            };
          }
        });

        // parent nodes need to appear before their children in nodes array
        nodes.insertAt(0, parentNode);
      });
    }
  };

  if (
    contextMenu?.type === 'node' &&
    contextMenu.items.length > 1 &&
    contextMenu.items.every(
      ({ parentNode, type }) => type !== 'parent' && !parentNode
    )
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
