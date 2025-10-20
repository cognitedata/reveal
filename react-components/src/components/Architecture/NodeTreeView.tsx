import { type ReactElement } from 'react';

import {
  AdvancedTreeView,
  onRecursiveToggleNode,
  onSingleSelectNode,
  type TreeNodeType
} from '../../advanced-tree-view';
import { type CadLazyLoader } from '../../../stories/tree-view-cad/cad-lazy-loader';

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
