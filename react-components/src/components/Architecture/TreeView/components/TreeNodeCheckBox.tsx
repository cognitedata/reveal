/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement } from 'react';
import { Checkbox } from '@cognite/cogs.js';
import { type ITreeNode } from '../../../../architecture/base/treeView/ITreeNode';
import { CheckBoxState, type TreeNodeAction } from '../../../../architecture/base/treeView/types';

export const TreeNodeCheckBox = ({
  node,
  onClick
}: {
  node: ITreeNode;
  onClick: TreeNodeAction;
}): ReactElement => {
  if (node.checkBoxState === CheckBoxState.Hidden) {
    return <></>;
  }
  if (node.checkBoxState === CheckBoxState.Some) {
    return (
      <Checkbox
        indeterminate={true}
        defaultChecked={true}
        checked={true}
        disabled={!node.isEnabled}
        onChange={() => {
          onClick(node);
        }}
      />
    );
  }
  const checked = node.checkBoxState === CheckBoxState.All;
  return (
    <Checkbox
      checked={checked}
      disabled={!node.isEnabled}
      onChange={() => {
        onClick(node);
      }}
    />
  );
};
