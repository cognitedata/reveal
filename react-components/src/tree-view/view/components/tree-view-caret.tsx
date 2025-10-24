import { type ReactElement, useState } from 'react';

import { CaretDownIcon, CaretRightIcon } from '@cognite/cogs.js';

import { type TreeNodeType } from '../../model/tree-node-type';
import { CARET_COLOR, CARET_SIZE, HOVER_CARET_COLOR } from '../constants';

export type TreeViewCaretProps = {
  node: TreeNodeType;
};

export const TreeViewCaret = ({ node }: TreeViewCaretProps): ReactElement => {
  const [isHover, setHover] = useState(false);
  const color = getColor(isHover);
  const size = CARET_SIZE + 'px';
  const style = { color, marginTop: '0px', width: size, height: size };

  if (node.isParent) {
    const Icon = node.isExpanded ? CaretDownIcon : CaretRightIcon;
    return (
      <Icon
        onClick={() => {
          node.isExpanded = !node.isExpanded;
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
