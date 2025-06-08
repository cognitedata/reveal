/* eslint-disable react/prop-types */
import { type ReactElement } from 'react';

import { Button } from '@cognite/cogs.js';

import { type TreeNodeType } from '../../model/tree-node-type';
import { type TreeNodeAction } from '../../model/types';
import { type AdvancedTreeViewProps } from '../advanced-tree-view-props';
import { HORIZONTAL_SPACING, INDENTATION, LOAD_MORE_LABEL } from '../constants';

export const TreeViewLoadMore = ({
  node,
  onClick,
  level,
  props
}: {
  node: TreeNodeType;
  onClick: TreeNodeAction;
  level: number;
  props: AdvancedTreeViewProps;
}): ReactElement => {
  const horizontalSpacing = HORIZONTAL_SPACING / 2 + 'px';
  const marginLeft = (level + 1) * INDENTATION + 'px';
  return (
    <Button
      type="secondary"
      size="small"
      style={{
        gap: horizontalSpacing,
        padding: '4px',
        marginTop: horizontalSpacing,
        marginLeft
      }}
      onClick={() => {
        onClick(node);
      }}>
      {props.loadMoreLabel ?? LOAD_MORE_LABEL}
    </Button>
  );
};
