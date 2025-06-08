import { type ReactElement } from 'react';

import {
  AdvancedTreeView,
  onRecursiveToggleNode,
  onSingleSelectNode,
  type TreeNodeType
} from '../../advanced-tree-view';
import { type CadNodesLoader } from '../../advanced-tree-view/storybook-cad/cad-nodes-loader';

export const NodeTreeView = (loader: CadNodesLoader): ReactElement => {
  return (
    <AdvancedTreeView
      loader={loader}
      onSelectNode={onSingleSelectNode}
      onToggleNode={onRecursiveToggleNode}
      onClickInfo={onClickInfo}
    />
  );
};

function onClickInfo(node: TreeNodeType): void {
  alert('You clicked: ' + node.label);
}
