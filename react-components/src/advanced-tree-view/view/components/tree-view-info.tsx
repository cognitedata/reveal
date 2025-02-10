/*!
 * Copyright 2025 Cognite AS
 */
/* eslint-disable react/prop-types */
import { useState, type ReactElement } from 'react';

import { InfoIcon } from '@cognite/cogs-icons';

import { type TreeNodeType } from '../../model/tree-node-type';
import { type AdvancedTreeViewProps } from '../advanced-tree-view-props';
import { HOVER_INFO_COLOR, INFO_COLOR } from '../constants';

export const TreeViewInfo = ({
  node,
  props
}: {
  node: TreeNodeType;
  props: AdvancedTreeViewProps;
}): ReactElement => {
  const Icon = InfoIcon;
  const [isHover, setHover] = useState(false);
  const color = getColor(isHover);
  return (
    <Icon
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
    if (props.onClickInfo === undefined) {
      return;
    }
    props.onClickInfo(inputNode);
  }
};

function getColor(isHoverOver: boolean): string | undefined {
  if (isHoverOver) {
    return HOVER_INFO_COLOR;
  }
  return INFO_COLOR;
}
