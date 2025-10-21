import { type ReactElement } from 'react';

import { AdvancedTreeView, type TreeNodeType } from '../../src/tree-view';
import { type CadLazyLoader } from '#test-utils/tree-view/cad-lazy-loader';
import { onRecursiveToggleNode, onSingleSelectNode } from './tree-node-functions';

export const NodeTreeView = (loader: CadLazyLoader): ReactElement => {
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
