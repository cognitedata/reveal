/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement, useState, useReducer } from 'react';
import { type TreeViewProps } from './TreeViewProps';
import { type ITreeNode } from '../../../architecture/base/treeView/ITreeNode';
import { CheckBoxState } from '../../../architecture/base/treeView/types';
import { useOnTreeNodeUpdate } from './utilities/useOnTreeNodeUpdate';
import { LoadingMoreLabel } from './components/LoadingMoreLabel';
import { LoadMoreButton } from './components/LoadMoreButton';
import { TreeNodeIcon } from './components/TreeNodeIcon';
import { TreeViewLabel } from './components/TreeViewLabel';
import { TreeNodeCaret } from './components/TreeNodeCaret';
import { TreeNodeCheckBox } from './components/TreeNodeCheckBox';
import { getChildrenAsArray } from './utilities/getChildrenAsArray';
import {
  DISABLED_TEXT_COLOR,
  GAP_BETWEEN_ITEMS,
  GAP_TO_CHILDREN,
  HOVER_BACKGROUND_COLOR,
  HOVER_TEXT_COLOR,
  SELECTED_BACKGROUND_COLOR,
  SELECTED_TEXT_COLOR,
  TEXT_COLOR
} from './utilities/constants';
import { TreeViewInfo } from './components/TreeViewInfo';

// ==================================================
// MAIN COMPONENT
// ==================================================

export const TreeViewNode = ({
  node,
  level,
  props
}: {
  node: ITreeNode;
  level: number;
  props: TreeViewProps;
}): ReactElement => {
  // Props
  const [hoverOverTextOrIcon, setHoverOverTextOrIcon] = useState(false);

  const children = getChildrenAsArray(node, props.loadNodes);
  const backgroundColor = getBackgroundColor(node, hoverOverTextOrIcon);
  const color = getTextColor(node, hoverOverTextOrIcon);
  const gapBetweenItems = (props.gapBetweenItems ?? GAP_BETWEEN_ITEMS) + 'px';
  const gapToChildren = props.gapToChildren ?? GAP_TO_CHILDREN;
  const hasHover = props.hasHover ?? true;
  const hasCheckBoxes = props.hasCheckboxes ?? false;
  const hasIcons = props.hasIcons ?? false;
  const hasInfo = props.hasInfo ?? false;
  const marginLeft = level * gapToChildren + 'px';

  // This force to update the component when the node changes
  // See https://coreui.io/blog/how-to-force-a-react-component-to-re-render/
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useOnTreeNodeUpdate(node, () => {
    forceUpdate();
  });

  return (
    <div>
      <div
        style={{
          flexDirection: 'row',
          display: 'flex',
          gap: gapBetweenItems,
          marginTop: gapBetweenItems,
          marginLeft
        }}>
        <TreeNodeCaret node={node} onClick={onExpandNode} props={props} />
        {hasCheckBoxes && <TreeNodeCheckBox node={node} onClick={onCheckNode} />}
        <div
          style={{
            backgroundColor,
            flexDirection: 'row',
            display: 'flex',
            color,
            gap: gapBetweenItems
          }}
          onClick={() => {
            onSelectNode(node);
          }}
          onMouseEnter={() => {
            onHoverOverTextOrIcon(node, true, hasHover);
          }}
          onMouseLeave={() => {
            onHoverOverTextOrIcon(node, false, hasHover);
          }}>
          {hasIcons && <TreeNodeIcon node={node} color={color} />}
          <TreeViewLabel node={node} props={props} />
          {hasInfo && <TreeViewInfo node={node} props={props} />}
        </div>
      </div>
      {children !== undefined &&
        children.map((node, index) => (
          <TreeViewNode node={node} key={index} level={level + 1} props={props} />
        ))}

      {!node.isLoadingSiblings && node.needLoadSiblings && (
        <LoadMoreButton node={node} onClick={onLoadMore} level={level} props={{ ...props }} />
      )}
      {node.isLoadingSiblings && <LoadingMoreLabel level={level} {...props} />}
    </div>
  );

  function onSelectNode(node: ITreeNode): void {
    if (!node.isEnabled) {
      return;
    }
    if (props.onSelectNode === undefined) {
      return;
    }
    props.onSelectNode(node);
  }

  function onCheckNode(node: ITreeNode): void {
    if (!node.isEnabled || node.checkBoxState === CheckBoxState.Hidden) {
      return;
    }
    if (props.onCheckNode === undefined) {
      return;
    }
    props.onCheckNode(node);
  }

  function onExpandNode(node: ITreeNode): void {
    if (!node.isParent) {
      return;
    }
    node.isExpanded = !node.isExpanded;
  }

  function onLoadMore(node: ITreeNode): void {
    if (props.loadNodes === undefined) {
      return;
    }
    void node.loadSiblings(props.loadNodes);
  }

  function onHoverOverTextOrIcon(node: ITreeNode, value: boolean, hasHover: boolean): void {
    if (!node.isEnabled) {
      return;
    }
    if (!hasHover) {
      return;
    }
    setHoverOverTextOrIcon(value);
  }

  function getBackgroundColor(node: ITreeNode, hover: boolean): string | undefined {
    if (!node.isEnabled) {
      return undefined;
    }
    if (node.isSelected) {
      return props.selectedBackgroundColor ?? SELECTED_BACKGROUND_COLOR;
    }
    if (hover) {
      return props.hoverBackgroundColor ?? HOVER_BACKGROUND_COLOR;
    }
    return undefined;
  }

  function getTextColor(node: ITreeNode, hover: boolean): string | undefined {
    if (!node.isEnabled) {
      return props.disabledTextColor ?? DISABLED_TEXT_COLOR;
    }
    if (node.isSelected) {
      return props.selectedTextColor ?? SELECTED_TEXT_COLOR;
    }
    if (hover) {
      return props.hoverTextColor ?? HOVER_TEXT_COLOR;
    }
    return props.textColor ?? TEXT_COLOR;
  }
};
