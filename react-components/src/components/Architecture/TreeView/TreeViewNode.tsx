/*!
 * Copyright 2023 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement, useEffect, useState, useCallback } from 'react';
import { Button, CaretDownIcon, CaretRightIcon, Checkbox, LoaderIcon } from '@cognite/cogs.js';
import {
  CheckBoxState,
  type TreeNodeAction,
  type ITreeNode,
  type IconColor,
  type LoadNodesAction
} from './ITreeNode';
import { IconComponentMapper } from '../IconComponentMapper';
import { type TreeViewProps } from './TreeViewProps';
import { type IconName } from '../../../architecture/base/utilities/IconName';

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
const GAP_TO_CHILDREN = 24;
const GAP_BETWEEN_ITEMS = 4;

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
  // @update-ui-component-pattern
  const [_label, setLabel] = useState<string>();
  const [_hasBoldLabel, setBoldLabel] = useState(false);
  const [_icon, setIcon] = useState<IconName | undefined>();
  const [_iconColor, setIconColor] = useState<IconColor>();
  const [_isSelected, setSelected] = useState(false);
  const [_isEnabled, setEnabled] = useState(true);
  const [_isExpanded, setExpanded] = useState(false);
  const [_checkBoxState, setCheckBoxState] = useState<CheckBoxState>();
  const [_isLoadingChildren, setLoadingChildren] = useState(false);
  const [isLoadingSiblings, setLoadingSiblings] = useState(false);
  const [needLoadSiblings, setNeedLoadSiblings] = useState(false);
  const [hoverOverTextOrIcon, setHoverOverTextOrIcon] = useState(false);

  const update = useCallback(
    (node: ITreeNode) => {
      setLabel(node.label);
      setBoldLabel(node.hasBoldLabel);
      setIcon(node.icon);
      setIconColor(node.iconColor);
      setSelected(node.isSelected);
      setEnabled(node.isEnabled);
      setExpanded(node.isExpanded);
      setCheckBoxState(node.checkBoxState);
      setLoadingChildren(node.isLoadingChildren);
      setLoadingSiblings(node.isLoadingSiblings);
      setNeedLoadSiblings(node.needLoadSiblings);
    },
    [node]
  );
  useEffect(() => {
    update(node);
    node.addTreeNodeListener(update);
    return () => {
      node.removeTreeNodeListener(update);
    };
  }, [node]);
  // @end

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
        <TreeNodeCaret node={node} onClick={onExpand} props={props} />
        {hasCheckBoxes && <TreeNodeCheckBox node={node} onClick={onCheck} />}
        <div
          style={{
            backgroundColor,
            flexDirection: 'row',
            display: 'flex',
            color,
            gap: gapBetweenItems
          }}
          onClick={() => {
            onSelect(node);
          }}
          onMouseEnter={() => {
            onHoverOverTextOrIcon(node, true, hasHover);
          }}
          onMouseLeave={() => {
            onHoverOverTextOrIcon(node, false, hasHover);
          }}>
          {hasIcons && <TreeNodeIcon node={node} color={color} />}
          <TreeViewLabel node={node} />
        </div>
      </div>
      {children !== undefined &&
        children.map((node, index) => (
          <TreeViewNode node={node} key={index} level={level + 1} props={props} />
        ))}

      {!isLoadingSiblings && needLoadSiblings && (
        <LoadMoreButton node={node} onClick={onLoadMore} level={level} props={props} />
      )}
      {isLoadingSiblings && <LoadingMoreLabel level={level} props={props} />}
    </div>
  );

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

  function onSelect(node: ITreeNode): void {
    if (!node.isEnabled) {
      return;
    }
    if (props.onSelect === undefined) {
      return;
    }
    props.onSelect(node);
  }

  function onCheck(node: ITreeNode): void {
    if (!node.isEnabled || node.checkBoxState === CheckBoxState.Hidden) {
      return;
    }
    if (props.onCheck === undefined) {
      return;
    }
    props.onCheck(node);
  }

  function onExpand(node: ITreeNode): void {
    if (node.isLeaf) {
      return;
    }
    node.isExpanded = !node.isExpanded;
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

  if (!node.isLeaf) {
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
      {'Load more ...'}
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
  const label = 'Loading ...';
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

const TreeViewLabel = ({ node }: { node: ITreeNode }): ReactElement => {
  const label = node.isLoadingChildren ? 'Loading children ...' : node.label;
  if (node.hasBoldLabel) {
    return <b>{label}</b>;
  }
  return <span>{label}</span>;
};

export function getChildrenAsArray(
  node: ITreeNode,
  loadChildren: LoadNodesAction | undefined,
  useExpanded = true
): ITreeNode[] | undefined {
  if (useExpanded && !node.isExpanded) {
    return undefined;
  }
  if (node.getChildren(loadChildren).next().value === undefined) {
    return undefined;
  }
  return Array.from(node.getChildren(loadChildren));
}

function getCaretColor(
  node: ITreeNode,
  props: TreeViewProps,
  isHoverOver: boolean
): string | undefined {
  if (node.isLeaf) {
    return 'transparent';
  }
  if (isHoverOver) {
    return props.hoverCaretColor ?? HOVER_CARET_COLOR;
  }
  return props.caretColor ?? CARET_COLOR;
}
