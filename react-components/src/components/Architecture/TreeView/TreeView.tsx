/*!
 * Copyright 2024 Cognite AS
 */

import { useReducer, type ReactElement } from 'react';
import { type TreeViewProps } from './TreeViewProps';
import { TreeViewNode } from './TreeViewNode';
import { getChildrenAsArray } from './utilities/getChildrenAsArray';
import { BACKGROUND_COLOR } from './utilities/constants';
import { useOnTreeNodeUpdate } from './utilities/useOnTreeNodeUpdate';

export const TreeView = (props: TreeViewProps): ReactElement => {
  const id = 'treeView';
  const showRoot = props.showRoot ?? true;
  const { root } = props;
  const childLevel = showRoot ? 1 : 0;
  const nodes = getChildrenAsArray(root, props.loadNodes, false);
  const isExpanded = !showRoot || root.isExpanded;
  if (nodes === undefined) {
    return <></>;
  }
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useOnTreeNodeUpdate(root, () => {
    forceUpdate();
  });

  return (
    <div
      id={id}
      style={{
        backgroundColor: props.backgroundColor ?? BACKGROUND_COLOR
      }}>
      {showRoot && <TreeViewNode node={root} key={-1} level={0} props={props} recursive={false} />}
      {isExpanded &&
        nodes.map((node, index) => (
          <TreeViewNode node={node} key={index} level={childLevel} props={props} />
        ))}
    </div>
  );
};
