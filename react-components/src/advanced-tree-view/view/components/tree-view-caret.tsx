/*!
 * Copyright 2025 Cognite AS
 */
import { type ReactElement, useState } from 'react';

import { CaretDownIcon, CaretRightIcon } from '@cognite/cogs.js';

import { type TreeNodeType } from '../../model/tree-node-type';
import { type TreeNodeAction } from '../../model/types';
import { type AdvancedTreeViewProps } from '../advanced-tree-view-props';
import { CARET_COLOR, CARET_SIZE, HOVER_CARET_COLOR } from '../constants';

export const TreeViewCaret = ({
  node,
  onClick
}: {
  node: TreeNodeType;
  onClick: TreeNodeAction;
  props: AdvancedTreeViewProps;
}): ReactElement => {
  const [isHover, setHover] = useState(false);
  const color = getColor(isHover);
  const size = CARET_SIZE + 'px';
  const style = { color, marginTop: '0px', width: size, height: size };

  if (node.isParent) {
    const Icon = node.isExpanded ? CaretDownIcon : CaretRightIcon;
    return (
      <Icon
        onClick={() => {
          onClick(node);
        }}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
        style={style}
      />
    );
  }
  return <div style={style} />;
};

function getColor(isHoverOver: boolean): string | undefined {
  if (isHoverOver) {
    return HOVER_CARET_COLOR;
  }
  return CARET_COLOR;
}
