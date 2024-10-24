/*!
 * Copyright 2023 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement } from 'react';
import { type TreeViewProps } from './TreeViewProps';
import { getChildrenAsArray, TreeViewNode } from './TreeViewNode';

const BACKGROUND_COLOR = 'white';

export const TreeView = (props: TreeViewProps): ReactElement => {
  const id = 'treeView';
  const nodes = getChildrenAsArray(props.root, props.loadNodes, false);
  if (nodes === undefined) {
    return <></>;
  }
  return (
    <div
      // ref={htmlRef}
      id={id}
      style={{
        backgroundColor: props.backgroundColor ?? BACKGROUND_COLOR
      }}>
      {nodes.map((node, index) => (
        <TreeViewNode node={node} key={index} level={0} props={props} />
      ))}
    </div>
  );
};
