import { useState, type ReactElement } from 'react';
import { InfoIcon } from '@cognite/cogs.js';
import { type TreeNodeType } from '../../model/tree-node-type';
import { HOVER_INFO_COLOR, INFO_COLOR } from '../constants';
import { type TreeNodeAction } from '../../model/types';

export type TreeViewInfoProps = {
  node: TreeNodeType;
  onClick?: TreeNodeAction;
};

export const TreeViewInfo = ({ node, onClick }: TreeViewInfoProps): ReactElement => {
  const [isHover, setHover] = useState(false);
  const color = getColor(isHover);
  return (
    <InfoIcon
      style={{ color, marginTop: '2px' }}
      onClick={() => {
        onClickInfo(node);
      }}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    />
  );

  function onClickInfo(inputNode: TreeNodeType): void {
    if (onClick === undefined) {
      return;
    }
    onClick(inputNode);
  }
};

function getColor(isHoverOver: boolean): string | undefined {
  if (isHoverOver) {
    return HOVER_INFO_COLOR;
  }
  return INFO_COLOR;
}
