import { type ReactElement } from 'react';

import {
  AdvancedTreeView,
  onRecursiveToggleNode,
  onSingleSelectNode,
  type TreeNodeType
} from '../../src/advanced-tree-view';
import { type CadLazyLoader } from './cad-lazy-loader';

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
