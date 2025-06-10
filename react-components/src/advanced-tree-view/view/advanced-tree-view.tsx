import { useState, type ReactElement } from 'react';

import { Loader } from '@cognite/cogs.js';

import { getChildrenAsArray } from '../model/get-children-as-array';

import { AdvancedTreeViewNode } from './advanced-tree-view-node';
import { type AdvancedTreeViewProps } from './advanced-tree-view-props';

export const AdvancedTreeView = (props: AdvancedTreeViewProps): ReactElement => {
  const id = 'advancedTreeView';
  const [root, setRoot] = useState(props.loader?.root ?? props.root);

  if (props.loader !== undefined && props.loader.loadInitialRoot !== undefined) {
    void props.loader.loadInitialRoot().then(() => {
      setRoot(props.loader?.root);
    });
  }
  if (root === undefined) {
    return <Loader />;
  }
  if (props.showRoot !== false) {
    return <AdvancedTreeViewNode node={root} key={root.id} level={0} props={props} />;
  }
  const nodes = getChildrenAsArray(root, props.loader, false);
  if (nodes === undefined) {
    return <></>;
  }
  return (
    <div id={id}>
      {nodes.map((node) => (
        <AdvancedTreeViewNode node={node} key={node.id} level={0} props={props} />
      ))}
    </div>
  );
};
