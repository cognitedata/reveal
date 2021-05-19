import React from 'react';
import { Icon } from '@cognite/cogs.js';

export const INFO_BTN_CLASSNAME = 'tree-view-info-btn';
export const TREE_NODE_CLASSNAME = 'tree-view-node';

type Props = {
  name: string;
};

export function NodeWithInfoButton({ name }: Props) {
  return (
    <div className={TREE_NODE_CLASSNAME}>
      {name}&nbsp;
      <Icon className={INFO_BTN_CLASSNAME} type="Info" />
    </div>
  );
}
