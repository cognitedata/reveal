import React from 'react';
import { Icon } from '@cognite/cogs.js';
import { INFO_BTN_CLASSNAME, TREE_NODE_CLASSNAME } from './constants';

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
