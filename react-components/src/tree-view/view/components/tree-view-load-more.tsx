import { type ReactElement } from 'react';
import { Button } from '@cognite/cogs.js';
import { type TreeNodeType } from '../../model/tree-node-type';
import { HORIZONTAL_SPACING, INDENTATION, LOAD_MORE_LABEL } from '../constants';
import { type ILazyLoader } from '../../model/i-lazy-loader';

export type TreeViewLoadMoreProps = {
  node: TreeNodeType;
  level: number;
  label?: string;
  loader: ILazyLoader;
};

export const TreeViewLoadMore = ({
  node,
  level,
  label,
  loader
}: TreeViewLoadMoreProps): ReactElement => {
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
      onClick={async () => {
        if (node.loadSiblings === undefined) return;
        await node.loadSiblings(loader);
      }}>
      {label ?? LOAD_MORE_LABEL}
    </Button>
  );
};
