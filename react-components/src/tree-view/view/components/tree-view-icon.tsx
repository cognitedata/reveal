import { type ReactElement } from 'react';

import { type TreeNodeType } from '../../model/tree-node-type';
import { type GetIconFromIconNameFn } from '../advanced-tree-view-props';

export const TreeViewIcon = ({
  node,
  getIconFromIconName
}: {
  node: TreeNodeType;
  getIconFromIconName: GetIconFromIconNameFn;
}): ReactElement => {
  const Icon = getIconFromIconName(node.icon);
  return <Icon style={{ color: node.iconColor, marginTop: '2px' }} />;
};
