/*!
 * Copyright 2023 Cognite AS
 */

/* eslint-disable react/prop-types */

import { type ReactElement, useEffect, useState, useCallback } from 'react';
import { CaretDownIcon, CaretRightIcon, Checkbox, HourglassIcon } from '@cognite/cogs.js';
import { CheckBoxState, type TreeNodeAction, type ITreeNode } from './ITreeNode';
import { IconComponentMapper } from '../IconComponentMapper';
import { type TreeViewProps } from './TreeViewProps';

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
const GAP_TO_CHILDREN = 15;
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
  // States
  const [hoverOverTextOrIcon, setHoverOverTextOrIcon] = useState(false);
  const [_isSelected, setSelected] = useState<boolean>();
  const [_checkBoxState, setCheckBoxState] = useState<CheckBoxState>();
  const [_enabled, setEnabled] = useState<boolean>();
  const [_expanded, setExpanded] = useState<boolean>();
  const [_hasBoldLabel, setBoldLabel] = useState<boolean>();
  const [_isLoadingChildren, setLoadingChildren] = useState<boolean>();

  const children = getChildrenAsArray(node);
  const backgroundColor = getBackgroundColor(node, hoverOverTextOrIcon);
  const color = getTextColor(node, hoverOverTextOrIcon);
  const gapBetweenItems = (props.gapBetweenItems ?? GAP_BETWEEN_ITEMS) + 'px';
  const gapToChildren = props.gapToChildren ?? GAP_TO_CHILDREN;
  const hasHover = props.hasHover ?? true;
  const hasCheckBoxes = props.hasCheckboxes ?? false;
  const hasIcons = props.hasIcons ?? false;

  const update = useCallback((node: ITreeNode) => {
    setSelected(node.isSelected);
    setCheckBoxState(node.checkBoxState);
    setEnabled(node.isEnabled);
    setExpanded(node.isExpanded);
    setBoldLabel(node.hasBoldLabel);
    setLoadingChildren(node.isLoadingChildren);
  }, []);

  useEffect(() => {
    update(node);
    node.addTreeNodeListener(update);
    return () => {
      node.removeTreeNodeListener(update);
    };
  }, [node]);

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
    </div>
  );

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
  if (node.iconColor !== undefined) {
    color = node.iconColor;
  }
  const Icon = node.isLoadingChildren ? HourglassIcon : IconComponentMapper.getIcon(node.icon);
  return <Icon style={{ color, marginTop: '3px' }} />;
};

const TreeViewLabel = ({ node }: { node: ITreeNode }): ReactElement => {
  const label = node.isLoadingChildren ? 'Loading children ...' : node.label;
  if (node.hasBoldLabel) {
    return <b>{label}</b>;
  }
  return <span>{label}</span>;
};

export function getChildrenAsArray(node: ITreeNode, useExpanded = true): ITreeNode[] | undefined {
  if (useExpanded && !node.isExpanded) {
    return undefined;
  }
  if (node.isLoadingChildren) {
    return undefined;
  }
  if (node.getChildren().next().value === undefined) {
    return undefined;
  }
  return Array.from(node.getChildren());
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
