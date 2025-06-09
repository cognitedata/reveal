import { type ReactElement, type FC } from 'react';
import { type IconProps } from '@cognite/cogs.js';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconFactory } from './Factories/IconFactory';

import { AdvancedTreeView, type TreeNodeType } from '../../advanced-tree-view';
import { DomainObject } from '../../architecture';

export const TreeView = (): ReactElement => {
  const renderTarget = useRenderTarget();
  return (
    <AdvancedTreeView
      root={renderTarget.rootDomainObject}
      onSelectNode={onSelectDomainObject}
      onToggleNode={onToggleDomainObject}
      getIconFromIconName={getIconFromIconName}
    />
  );
};

function getIconFromIconName(icon: IconName): FC<IconProps> {
  return IconFactory.getIcon(icon);
}

function onSelectDomainObject(node: TreeNodeType): void {
  if (!(node instanceof DomainObject)) {
    return;
  }
  // Deselect all others
  const root = node.root;
  for (const descendant of root.getThisAndDescendants()) {
    if (descendant !== node) {
      descendant.setSelectedInteractive(false);
    }
  }
  node.setSelectedInteractive(!node.isSelected);
}

function onToggleDomainObject(node: TreeNodeType): void {
  if (!(node instanceof DomainObject)) {
    return;
  }
  node.toggleVisibleInteractive();
}
