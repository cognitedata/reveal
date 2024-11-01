/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement, useState } from 'react';
import { CaretDownIcon, CaretRightIcon } from '@cognite/cogs.js';
import { type TreeViewProps } from '../TreeViewProps';
import { type ITreeNode } from '../../../../architecture/base/treeView/ITreeNode';
import { type TreeNodeAction } from '../../../../architecture/base/treeView/types';
import { CARET_COLOR, CARET_SIZE, HOVER_CARET_COLOR } from '../utilities/constants';

// ==================================================
// MAIN COMPONENT
// ==================================================

export const TreeNodeCaret = ({
  node,
  onClick,
  props
}: {
  node: ITreeNode;
  onClick: TreeNodeAction;
  props: TreeViewProps;
}): ReactElement => {
  const [isHoverOver, setHoverOver] = useState(false);
  const color = getCaretColor(node, props, isHoverOver);
  const size = props.caretSize ?? CARET_SIZE;
  const sizePx = size + 'px';
  const style = { color, marginTop: '0px', width: sizePx, height: sizePx };

  if (node.isParent) {
    const Icon = node.isExpanded ? CaretDownIcon : CaretRightIcon;
    return (
      <Icon
        onClick={() => {
          onClick(node);
        }}
        onMouseEnter={() => {
          setHoverOver(true);
        }}
        onMouseLeave={() => {
          setHoverOver(false);
        }}
        style={style}
      />
    );
  }
  return <CaretDownIcon style={style} />;
};

function getCaretColor(
  node: ITreeNode,
  props: TreeViewProps,
  isHoverOver: boolean
): string | undefined {
  if (!node.isParent) {
    return 'transparent';
  }
  if (isHoverOver) {
    return props.hoverCaretColor ?? HOVER_CARET_COLOR;
  }
  return props.caretColor ?? CARET_COLOR;
}
