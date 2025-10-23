import { type ReactElement } from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import { type TreeNodeType } from '../../model/tree-node-type';
import { MAX_LABEL_LENGTH, TOOLTIP_DELAY } from '../constants';

export const TreeViewLabel = ({
  node,
  maxLabelLength
}: {
  node: TreeNodeType;
  maxLabelLength?: number;
}): ReactElement => {
  let disabledTooltip = true;
  let label = node.label;

  if (maxLabelLength === undefined) {
    maxLabelLength = MAX_LABEL_LENGTH;
  }
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
