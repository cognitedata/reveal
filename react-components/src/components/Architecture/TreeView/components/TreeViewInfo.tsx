/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable react/prop-types */

import { useState, type ReactElement } from 'react';
import { type TreeViewProps } from '../TreeViewProps';
import { type ITreeNode } from '../../../../architecture/base/treeView/ITreeNode';
import { InfoIcon } from '@cognite/cogs.js';
import { HOVER_INFO_COLOR, INFO_COLOR } from '../utilities/constants';

// ==================================================
// MAIN COMPONENT
// ==================================================

export const TreeViewInfo = ({
  node,
  props
}: {
  node: ITreeNode;
  props: TreeViewProps;
}): ReactElement => {
  const Icon = InfoIcon;
  const [isHoverOver, setHoverOver] = useState(false);
  const color = getColor(props, isHoverOver);
  return (
    <Icon
      style={{ color, marginTop: '3px' }}
      onClick={() => {
        onClickInfo(node);
      }}
      onMouseEnter={() => {
        setHoverOver(true);
      }}
      onMouseLeave={() => {
        setHoverOver(false);
      }}
    />
  );

  function onClickInfo(node: ITreeNode): void {
    if (props.onClickInfoBox === undefined) {
      return;
    }
    props.onClickInfoBox(node);
  }
};

function getColor(props: TreeViewProps, isHoverOver: boolean): string | undefined {
  if (isHoverOver) {
    return props.hoverInfoColor ?? HOVER_INFO_COLOR;
  }
  return props.infoColor ?? INFO_COLOR;
}
