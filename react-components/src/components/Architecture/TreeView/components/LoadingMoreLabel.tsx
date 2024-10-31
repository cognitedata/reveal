/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement } from 'react';
import { LoaderIcon } from '@cognite/cogs.js';
import { type TreeViewProps } from '../TreeViewProps';
import { GAP_BETWEEN_ITEMS, GAP_TO_CHILDREN, LOADING_LABEL } from '../utilities/constants';

// ==================================================
// MAIN COMPONENT
// ==================================================

export const LoadingMoreLabel = ({
  level,
  props
}: {
  level: number;
  props: TreeViewProps;
}): ReactElement => {
  const label = props.loadingLabel ?? LOADING_LABEL;
  const gapBetweenItems = (props.gapBetweenItems ?? GAP_BETWEEN_ITEMS) + 'px';
  const gapToChildren = props.gapToChildren ?? GAP_TO_CHILDREN;
  return (
    <div
      style={{
        gap: gapBetweenItems,
        marginTop: gapBetweenItems,
        marginLeft: (level + 1) * gapToChildren + 'px'
      }}>
      <LoaderIcon style={{ marginTop: '3px', marginRight: '5px' }} />
      <span>{label}</span>
    </div>
  );
};
