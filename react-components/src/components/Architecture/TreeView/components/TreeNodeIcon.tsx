/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement } from 'react';
import { LoaderIcon } from '@cognite/cogs.js';
import { IconFactory } from '../../Factories/IconFactory';
import { type ITreeNode } from '../../../../architecture/base/treeView/ITreeNode';

// ==================================================
// MAIN COMPONENT
// ==================================================

export const TreeNodeIcon = ({
  node,
  color
}: {
  node: ITreeNode;
  color: string | undefined;
}): ReactElement => {
  if (!node.isSelected && node.iconColor !== undefined) {
    color = node.iconColor;
  }
  const Icon = node.isLoadingChildren ? LoaderIcon : IconFactory.getIcon(node.icon);
  return <Icon style={{ color, marginTop: '3px' }} />;
};
