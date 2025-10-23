/* eslint-disable react/prop-types */
import { type ReactElement } from 'react';

import { Button } from '@cognite/cogs.js';

import { type TreeNodeType } from '../../model/tree-node-type';
import { type TreeNodeAction } from '../../model/types';
import { HORIZONTAL_SPACING, INDENTATION, LOAD_MORE_LABEL } from '../constants';

export const TreeViewLoadMore = ({
  node,
  onClick,
  level,
  label
}: {
  node: TreeNodeType;
  onClick: TreeNodeAction;
  level: number;
  label?: string;
}): ReactElement => {
  const horizontalSpacing = HORIZONTAL_SPACING / 2 + 'px';
  const marginLeft = (level + 1) * INDENTATION + 'px';
  return (
    <Button
      type="secondary"
      size="small"
      aria-label={label}
      style={{
        gap: horizontalSpacing,
        padding: '4px',
        marginTop: horizontalSpacing,
        marginLeft
      }}
      onClick={() => {
        onClick(node);
      }}>
      {label ?? LOAD_MORE_LABEL}
    </Button>
  );
};
