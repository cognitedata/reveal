/*!
 * Copyright 2025 Cognite AS
 */
/* eslint-disable react/prop-types */
import { type ReactElement, useReducer, useState } from 'react';

import { Colors } from '@cognite/cogs-core';

import { getChildrenAsArray } from '../model/get-children-as-array';
import { type TreeNodeType } from '../model/tree-node-type';

import { type AdvancedTreeViewProps } from './advanced-tree-view-props';
import { TreeViewCaret } from './components/tree-view-caret';
import { TreeViewCheckbox } from './components/tree-view-checkbox';
import { TreeViewIcon } from './components/tree-view-icon';
import { TreeViewInfo } from './components/tree-view-info';
import { TreeViewLabel } from './components/tree-view-label';
import { TreeViewLoadMore } from './components/tree-view-load-more';
import { TreeViewLoading } from './components/tree-view-loading';
import { HORIZONTAL_SPACING, INDENTATION, VERTICAL_SPACING } from './constants';
import { useOnTreeNodeUpdate } from './use-on-tree-node-update';

// ==================================================
// MAIN COMPONENT
// ==================================================

export const AdvancedTreeViewNode = ({
  node: inputNode,
  level,
  props
}: {
  node: TreeNodeType;
  level: number;
  props: AdvancedTreeViewProps;
}): ReactElement => {
  // Props
  const [isHover, setHover] = useState(false);
  // This force to update the component when the node changes
  // See https://coreui.io/blog/how-to-force-a-react-component-to-re-render/
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useOnTreeNodeUpdate(inputNode, () => {
    forceUpdate();
  });
  if (inputNode.isVisibleInTree === false) {
    return <></>;
  }

  const children = getChildrenAsArray(inputNode, props.loader);
  const horizontalSpacing = HORIZONTAL_SPACING + 'px';
  const verticalSpacing = VERTICAL_SPACING + 'px';
  const marginLeft = level * INDENTATION + 'px';
  const backgroundColor = getBackgroundColor(inputNode, isHover);
  const hasHover = props.hasHover ?? true;
  const hasCheckboxes = props.hasCheckboxes ?? true;
  const hasInfo = props.onClickInfo !== undefined && inputNode.hasInfoIcon !== false;
  const isLoadingChildren = inputNode.isLoadingChildren === true;
  const hasLoadMore =
    inputNode.isLoadingSiblings === false &&
    inputNode.needLoadSiblings === true &&
    inputNode.loadSiblings !== undefined;

  return (
    <div>
      <div
        id={inputNode.id}
        style={{
          backgroundColor,
          flexDirection: 'row',
          display: 'flex',
          color: getTextColor(inputNode),
          gap: horizontalSpacing,
          paddingTop: verticalSpacing,
          paddingBottom: verticalSpacing,
          marginLeft,
          borderRadius: '4px'
        }}
        onMouseEnter={() => {
          onHover(inputNode, true);
        }}
        onMouseLeave={() => {
          onHover(inputNode, false);
        }}>
        <TreeViewCaret node={inputNode} onClick={onExpandNode} props={props} />
        {hasCheckboxes && <TreeViewCheckbox node={inputNode} onClick={onToggleNode} />}
        <div
          style={{
            flexDirection: 'row',
            display: 'flex',
            gap: horizontalSpacing
          }}
          onClick={(event) => {
            onSelectNode(inputNode);
            event.stopPropagation();
            event.preventDefault();
          }}>
          {props.getIconFromIconName !== undefined && inputNode.icon !== undefined && (
            <TreeViewIcon node={inputNode} getIconFromIconName={props.getIconFromIconName} />
          )}
          {isLoadingChildren && <TreeViewLoading level={undefined} {...props} />}
          {!isLoadingChildren && <TreeViewLabel node={inputNode} props={props} />}
        </div>
        {hasInfo && <TreeViewInfo node={inputNode} props={props} />}
      </div>
      {children !== undefined &&
        children.map((node) => (
          <AdvancedTreeViewNode node={node} key={node.id} level={level + 1} props={props} />
        ))}
      {hasLoadMore && (
        <TreeViewLoadMore
          node={inputNode}
          onClick={onLoadMore}
          level={level}
          props={{ ...props }}
        />
      )}
      {inputNode.isLoadingSiblings === true && <TreeViewLoading level={level} {...props} />}
    </div>
  );

  function onSelectNode(node: TreeNodeType): void {
    if (props.onSelectNode === undefined) {
      return;
    }
    props.onSelectNode(node);
  }

  function onToggleNode(node: TreeNodeType): void {
    if (node.isCheckboxEnabled !== true || node.checkboxState === undefined) {
      return;
    }
    if (props.onToggleNode === undefined) {
      return;
    }
    props.onToggleNode(node);
  }

  function onExpandNode(node: TreeNodeType): void {
    if (!node.isParent) {
      return;
    }
    node.isExpanded = !node.isExpanded;
  }

  function onLoadMore(node: TreeNodeType): void {
    if (props.loader === undefined) {
      return;
    }
    if (node.loadSiblings === undefined) {
      return;
    }
    void node.loadSiblings(props.loader);
  }

  function onHover(node: TreeNodeType, value: boolean): void {
    if (!hasHover) {
      return;
    }
    setHover(value);
  }
};

function getBackgroundColor(node: TreeNodeType, hover: boolean): string | undefined {
  if (node.isSelected) {
    return Colors['surface--interactive--toggled-pressed'];
  }
  if (hover) {
    return Colors['surface--interactive--hover'];
  }
  return undefined;
}

function getTextColor(_node: TreeNodeType): string | undefined {
  return Colors['text-icon--strong'];
}
