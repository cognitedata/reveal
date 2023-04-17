import { WorkflowContextMenu } from './ContextMenu';
import { ContextMenuItem } from './ContextMenuItem';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';

type UngroupNodesProps = {
  contextMenu?: WorkflowContextMenu;
};

export const UngroupNodes = ({
  contextMenu,
}: UngroupNodesProps): JSX.Element => {
  const { changeNodes } = useWorkflowBuilderContext();

  const handleUngroup = (): void => {
    if (contextMenu?.type === 'node') {
      const parentNode = contextMenu?.items.find(
        ({ type }) => type === 'groupNode'
      );
      if (parentNode) {
        changeNodes((nodes) => {
          const parentNodeIndex = nodes.findIndex(
            (node) => node.id === parentNode.id
          );
          nodes.deleteAt(parentNodeIndex);
          nodes
            .filter((node) => node.parentNode === parentNode.id)
            .forEach((node) => {
              delete node.parentNode;
              node.draggable = true;
              node.position = {
                x: node.position.x + parentNode.position.x,
                y: node.position.y + parentNode.position.y,
              };
            });
        });
      }
    }
  };

  if (
    contextMenu?.type === 'node' &&
    contextMenu.items.filter(({ type }) => type === 'groupNode').length === 1
  ) {
    return (
      <ContextMenuItem label="Ungroup" onClick={handleUngroup} shortcut="⌘+U" />
    );
  }

  return <></>;
};
