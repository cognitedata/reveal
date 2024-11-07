/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement } from 'react';
import { type TreeViewProps } from './TreeViewProps';
import { TreeViewNode } from './TreeViewNode';
import { getChildrenAsArray } from './utilities/getChildrenAsArray';
import { BACKGROUND_COLOR } from './utilities/constants';

export const TreeView = (props: TreeViewProps): ReactElement => {
  const id = 'treeView';
  const showRoot = props.showRoot ?? true;
  const { root } = props;
  const nodes = getChildrenAsArray(root, props.loadNodes, false);
  if (nodes === undefined) {
    return <></>;
  }
  return (
    <div
      id={id}
      style={{
        backgroundColor: props.backgroundColor ?? BACKGROUND_COLOR
      }}>
      {showRoot && <TreeViewNode node={root} key={-1} level={0} props={props} />}
      {nodes.map((node, index) => (
        <TreeViewNode node={node} key={index} level={1} props={props} />
      ))}
    </div>
  );
};
