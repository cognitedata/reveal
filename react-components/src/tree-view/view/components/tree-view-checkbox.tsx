import { type ReactElement } from 'react';

import { Checkbox } from '@cognite/cogs.js';

import { type TreeNodeType } from '../../model/tree-node-type';
import { type TreeNodeAction } from '../../model/types';
import { CheckboxState } from '../../../architecture/base/utilities/types';

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
