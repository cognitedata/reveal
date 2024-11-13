/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement } from 'react';
import { Button } from '@cognite/cogs.js';
import { type TreeViewProps } from '../TreeViewProps';
import { type ITreeNode } from '../../../../architecture/base/treeNodes/ITreeNode';
import { type TreeNodeAction } from '../../../../architecture/base/treeNodes/types';
import { GAP_BETWEEN_ITEMS, GAP_TO_CHILDREN, LOAD_MORE_LABEL } from '../utilities/constants';

// ==================================================
// MAIN COMPONENT
// ==================================================

export const LoadMoreButton = ({
  node,
  onClick,
  level,
  props
}: {
  node: ITreeNode;
  onClick: TreeNodeAction;
  level: number;
  props: TreeViewProps;
}): ReactElement => {
  const gapBetweenItems = (props.gapBetweenItems ?? GAP_BETWEEN_ITEMS) + 'px';
  const gapToChildren = props.gapToChildren ?? GAP_TO_CHILDREN;
  const marginLeft = (level + 1) * gapToChildren + 'px';
  return (
    <Button
      style={{
        gap: gapBetweenItems,
        padding: '4px',
        marginTop: gapBetweenItems,
        marginLeft
      }}
      onClick={() => {
        onClick(node);
      }}>
      {props.loadMoreLabel ?? LOAD_MORE_LABEL}
    </Button>
  );
};
