/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement } from 'react';
import { type TreeViewProps } from '../TreeViewProps';
import { type ITreeNode } from '../../../../architecture/base/treeView/ITreeNode';
import { LOADING_LABEL } from '../utilities/constants';

// ==================================================
// MAIN COMPONENT
// ==================================================

export const TreeViewLabel = ({
  node,
  props
}: {
  node: ITreeNode;
  props: TreeViewProps;
}): ReactElement => {
  const label = node.isLoadingChildren ? (props.loadingLabel ?? LOADING_LABEL) : node.label;
  if (node.hasBoldLabel) {
    return <b>{label}</b>;
  }
  return <span>{label}</span>;
};
