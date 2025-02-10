/*!
 * Copyright 2025 Cognite AS
 */
import { type ReactElement } from 'react';

import { Checkbox } from '@cognite/cogs-core';

import { type TreeNodeType } from '../../model/tree-node-type';
import { CheckboxState, type TreeNodeAction } from '../../model/types';

export const TreeViewCheckbox = ({
  node,
  onClick
}: {
  node: TreeNodeType;
  onClick: TreeNodeAction;
}): ReactElement => {
  if (node.checkboxState === undefined) {
    return <></>;
  }
  if (node.checkboxState === CheckboxState.Some) {
    return (
      <Checkbox
        indeterminate={true}
        defaultChecked={true}
        checked={true}
        disabled={node.isCheckboxEnabled !== true}
        onChange={() => {
          onClick(node);
        }}
      />
    );
  }
  const checked = node.checkboxState === CheckboxState.All;
  return (
    <Checkbox
      checked={checked}
      disabled={node.isCheckboxEnabled !== true}
      onChange={() => {
        onClick(node);
      }}
    />
  );
};
