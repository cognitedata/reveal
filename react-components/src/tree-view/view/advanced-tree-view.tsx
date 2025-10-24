import { useContext, useState, type ReactElement } from 'react';
import { getChildrenAsArray } from './get-children-as-array';
import { type AdvancedTreeViewProps } from './advanced-tree-view-props';
import { CustomAdvancedTreeViewContext } from './advanced-tree-view.context';

export const AdvancedTreeView = (props: AdvancedTreeViewProps): ReactElement => {
  const id = 'advancedTreeView';
  const [root, setRoot] = useState(props.loader?.root ?? props.root);
  const { Loader, AdvancedTreeViewNode } = useContext(CustomAdvancedTreeViewContext);

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
