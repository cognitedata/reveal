/*!
 * Copyright 2023 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement, useEffect, useState, useCallback, useReducer } from 'react';
import { Button, CaretDownIcon, CaretRightIcon, Checkbox, LoaderIcon } from '@cognite/cogs.js';
import { IconComponentMapper } from '../IconComponentMapper';
import { type TreeViewProps } from './TreeViewProps';
import { type ITreeNode } from '../../../architecture/base/treeView/ITreeNode';
import {
  CheckBoxState,
  type LoadNodesAction,
  type TreeNodeAction
} from '../../../architecture/base/treeView/types';

// ==================================================
// CONSTANTS
// ==================================================

const TEXT_COLOR = 'black';
const DISABLED_TEXT_COLOR = 'lightgray';
const SELECTED_TEXT_COLOR = 'white';
const SELECTED_BACKGROUND_COLOR = 'highlight';
const HOVER_TEXT_COLOR = 'black';
const HOVER_BACKGROUND_COLOR = 'lightgray';
const CARET_COLOR = 'gray';
const HOVER_CARET_COLOR = 'highlight';
const CARET_SIZE = 20;
const GAP_TO_CHILDREN = 16;
const GAP_BETWEEN_ITEMS = 4;
const LOADING_LABEL = 'Loading ...';
const LOAD_MORE_LABEL = 'Load more ...';

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
  const [hoverOverTextOrIcon, setHoverOverTextOrIcon] = useState(false);

  // This force to update the component when the node changes
  // See https://coreui.io/blog/how-to-force-a-react-component-to-re-render/
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const update = useCallback((_node: ITreeNode) => {
    forceUpdate();
  }, []);

  useEffect(() => {
    update(node);
    node.addTreeNodeListener(update);
    return () => {
      node.removeTreeNodeListener(update);
    };
  }, [node]);

  // Props
  const children = getChildrenAsArray(node, props.loadNodes);
  const backgroundColor = getBackgroundColor(node, hoverOverTextOrIcon);
  const color = getTextColor(node, hoverOverTextOrIcon);
  const gapBetweenItems = (props.gapBetweenItems ?? GAP_BETWEEN_ITEMS) + 'px';
  const gapToChildren = props.gapToChildren ?? GAP_TO_CHILDREN;
  const hasHover = props.hasHover ?? true;
  const hasCheckBoxes = props.hasCheckboxes ?? false;
  const hasIcons = props.hasIcons ?? false;

  return (
    <div>
      <div
        style={{
          flexDirection: 'row',
          display: 'flex',
          gap: gapBetweenItems,
          marginTop: gapBetweenItems,
          marginLeft: level * gapToChildren + 'px'
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
        </div>
      </div>
      {children !== undefined &&
        children.map((node, index) => (
          <TreeViewNode node={node} key={index} level={level + 1} props={props} />
        ))}

      {!node.isLoadingSiblings && node.needLoadSiblings && (
        <LoadMoreButton node={node} onClick={onLoadMore} level={level} props={props} />
      )}
      {node.isLoadingSiblings && <LoadingMoreLabel level={level} props={props} />}
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

// ==================================================
// OTHER COMPONENTS
// ==================================================

const TreeNodeCheckBox = ({
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

const TreeNodeCaret = ({
  node,
  onClick,
  props
}: {
  node: ITreeNode;
  onClick: TreeNodeAction;
  props: TreeViewProps;
}): ReactElement => {
  const [isHoverOver, setHoverOver] = useState(false);
  const color = getCaretColor(node, props, isHoverOver);
  const size = props.caretSize ?? CARET_SIZE;
  const sizePx = size + 'px';
  const style = { color, marginTop: '0px', width: sizePx, height: sizePx };

  if (node.isParent) {
    const Icon = node.isExpanded ? CaretDownIcon : CaretRightIcon;
    return (
      <Icon
        onClick={() => {
          onClick(node);
        }}
        onMouseEnter={() => {
          setHoverOver(true);
        }}
        onMouseLeave={() => {
          setHoverOver(false);
        }}
        style={style}
      />
    );
  }
  return <CaretDownIcon style={style} />;
};

const TreeNodeIcon = ({
  node,
  color
}: {
  node: ITreeNode;
  color: string | undefined;
}): ReactElement => {
  if (!node.isSelected && node.iconColor !== undefined) {
    color = node.iconColor;
  }
  const Icon = node.isLoadingChildren ? LoaderIcon : IconComponentMapper.getIcon(node.icon);
  return <Icon style={{ color, marginTop: '3px' }} />;
};

const LoadMoreButton = ({
  node,
  onClick,
  level,
  props
}: {
  node: ITreeNode;
  onClick: TreeNodeAction;
  level: number;
  props: TreeViewProps;
}): ReactElement => {
  const gapBetweenItems = (props.gapBetweenItems ?? GAP_BETWEEN_ITEMS) + 'px';
  const gapToChildren = props.gapToChildren ?? GAP_TO_CHILDREN;
  return (
    <Button
      style={{
        gap: gapBetweenItems,
        padding: '4px',
        marginTop: gapBetweenItems,
        marginLeft: (level + 1) * gapToChildren + 'px'
      }}
      onClick={() => {
        onClick(node);
      }}>
      {props.loadMoreLabel ?? LOAD_MORE_LABEL}
    </Button>
  );
};

const LoadingMoreLabel = ({
  level,
  props
}: {
  level: number;
  props: TreeViewProps;
}): ReactElement => {
  const label = props.loadingLabel ?? LOADING_LABEL;
  const gapBetweenItems = (props.gapBetweenItems ?? GAP_BETWEEN_ITEMS) + 'px';
  const gapToChildren = props.gapToChildren ?? GAP_TO_CHILDREN;
  return (
    <div
      style={{
        gap: gapBetweenItems,
        marginTop: gapBetweenItems,
        marginLeft: (level + 1) * gapToChildren + 'px'
      }}>
      <LoaderIcon style={{ marginTop: '3px', marginRight: '5px' }} />
      <span>{label}</span>
    </div>
  );
};

const TreeViewLabel = ({
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

// ==================================================
// FUNCTIONS
// ==================================================

export function getChildrenAsArray(
  node: ITreeNode,
  loadNodes: LoadNodesAction | undefined,
  useExpanded = true
): ITreeNode[] | undefined {
  if (useExpanded && !node.isExpanded) {
    return undefined;
  }
  if (node.getChildren(loadNodes).next().value === undefined) {
    return undefined;
  }
  return Array.from(node.getChildren(loadNodes));
}

function getCaretColor(
  node: ITreeNode,
  props: TreeViewProps,
  isHoverOver: boolean
): string | undefined {
  if (!node.isParent) {
    return 'transparent';
  }
  if (isHoverOver) {
    return props.hoverCaretColor ?? HOVER_CARET_COLOR;
  }
  return props.caretColor ?? CARET_COLOR;
}
