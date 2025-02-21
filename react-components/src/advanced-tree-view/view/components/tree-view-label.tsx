/*!
 * Copyright 2025 Cognite AS
 */
/* eslint-disable react/prop-types */
import { type ReactElement } from 'react';

import { Body, Tooltip } from '@cognite/cogs-core';

import { type TreeNodeType } from '../../model/tree-node-type';
import { type AdvancedTreeViewProps } from '../advanced-tree-view-props';
import { MAX_LABEL_LENGTH, TOOLTIP_DELAY } from '../constants';

export const TreeViewLabel = ({
  node,
  props
}: {
  node: TreeNodeType;
  props: AdvancedTreeViewProps;
}): ReactElement => {
  let disabledTooltip = true;
  let label = node.label;
  const maxLabelLength = props.maxLabelLength ?? MAX_LABEL_LENGTH;
  if (label.length > maxLabelLength) {
    label = label.substring(0, maxLabelLength) + '...';
    disabledTooltip = false;
  }

  const strong = node.hasBoldLabel === true;
  return (
    <Tooltip
      content={node.label}
      disabled={disabledTooltip}
      appendTo={document.body}
      enterDelay={TOOLTIP_DELAY}
      placement="right">
      <Body size="small" strong={strong}>
        {label}
      </Body>
    </Tooltip>
  );
};
