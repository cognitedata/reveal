/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, type RefObject, useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { PopupStyle } from '../../../architecture';
import { withSuppressRevealEvents } from '../../../higher-order-components/withSuppressRevealEvents';
import { CaretDownIcon, CaretRightIcon, Checkbox } from '@cognite/cogs.js';
import { CheckBoxState, type ITreeNode } from './ITreeNode';
import { IconComponentMapper } from '../IconComponentMapper';

type NodeAction = (node: ITreeNode) => boolean;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useRefDimensions = (ref: RefObject<HTMLDivElement>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const { current } = ref;
    if (current !== null) {
      const boundingRect = current.getBoundingClientRect();
      const { width, height } = boundingRect;
      setDimensions({ width: Math.round(width), height: Math.round(height) });
    }
  }, [ref]);
  return dimensions;
};

const BACKGROUND_COLOR = 'white';
const DISABLED_TEXT_COLOR = 'lightgray';
const SELECTED_TEXT_COLOR = 'white';
const SELECTED_BACKGROUND_COLOR = 'highlight';
const HOVER_TEXT_COLOR = 'black';
const HOVER_BACKGROUND_COLOR = 'lightgray';
const LEVEL_OFFSET = 15;

export type TreeViewProps = {
  textColor?: string;
  backgroundColor?: string;
  disabledTextColor?: string;
  selectedTextColor?: string;
  selectedBackgroundColor?: string;
  hoverTextColor?: string;
  hoverBackgroundColor?: string;
  levelOffset?: number;
  hasHover?: boolean;
  onSelect?: NodeAction;
  onCheck?: NodeAction;
  root: ITreeNode;
};

export const TreeView = (props: TreeViewProps): ReactElement => {
  const style = new PopupStyle({ top: 50, left: 100 });
  const htmlRef = useRef<HTMLDivElement>(null);
  const [counter, setCounter] = useState(0);
  const s = useRefDimensions(htmlRef);
  console.log(s.height, s.width);

  const levelOffset = props.levelOffset ?? LEVEL_OFFSET;
  const hasHover = props.hasHover ?? true;

  const onSelect = (node: ITreeNode): boolean => {
    if (!node.isEnabled) {
      return false;
    }
    if (props.onSelect === undefined) {
      return false;
    }
    if (!props.onSelect(node)) {
      return false;
    }
    setCounter(counter + 1);
    return true;
  };

  const onCheck = (node: ITreeNode): boolean => {
    if (!node.isEnabled || node.checkedBoxState === CheckBoxState.Hidden) {
      return false;
    }
    if (props.onCheck === undefined) {
      return false;
    }
    if (!props.onCheck(node)) {
      return false;
    }
    setCounter(counter + 1);
    return true;
  };

  const onExpand = (node: ITreeNode): boolean => {
    if (node.isLeaf) {
      return false;
    }
    node.isExpanded = !node.isExpanded;
    setCounter(counter + 1);
    return true;
  };

  const TreeNode = ({ node, level }: { node: ITreeNode; level: number }): ReactElement => {
    const [isHover, setHover] = useState(false);
    const children = getChildren(node);
    const hasChildren = children !== undefined;
    const backgroundColor = getBackgroundColor(node, isHover);
    const color = getTextColor(node, isHover);
    return (
      <div>
        <div
          style={{
            flexDirection: 'row',
            display: 'flex',
            gap: '5px',
            marginTop: '3px',
            marginLeft: level * levelOffset + 'px'
          }}>
          <TreeViewCaret node={node} onClick={onExpand} />
          <TreeViewCheckBox node={node} onClick={onCheck} />
          <div
            style={{
              backgroundColor,
              flexDirection: 'row',
              display: 'flex',
              color,
              gap: '5px'
            }}
            onClick={() => {
              onSelect(node);
            }}
            onMouseEnter={() => {
              onHover(node, true);
            }}
            onMouseLeave={() => {
              onHover(node, false);
            }}>
            <TreeViewIcon node={node} color={color} />
            <TreeViewLabel node={node} />
          </div>
        </div>
        {hasChildren &&
          children.map((node, index) => <TreeNode node={node} key={index} level={level + 1} />)}
      </div>
    );

    function onHover(node: ITreeNode, value: boolean): void {
      if (!hasHover || !node.isEnabled) {
        return;
      }
      setHover(value);
    }
  };

  const nodes = getChildren(props.root);
  if (nodes === undefined) {
    return <></>;
  }
  const level = 0;
  return (
    <Container
      ref={htmlRef}
      style={{
        width: '300px',
        height: '600px',
        left: style.leftPx,
        right: style.rightPx,
        backgroundColor: props.backgroundColor ?? BACKGROUND_COLOR,
        top: style.topPx,
        bottom: style.bottomPx,
        margin: style.marginPx,
        padding: style.paddingPx
      }}>
      {nodes.map((node, index) => (
        <TreeNode node={node} key={index} level={level} />
      ))}
    </Container>
  );

  function getChildren(node: ITreeNode): ITreeNode[] | undefined {
    if (!node.isExpanded) {
      return undefined;
    }
    if (node.getVisibleChildren().next().value === undefined) {
      return undefined;
    }
    return Array.from(node.getVisibleChildren());
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
    return props.textColor ?? 'black';
  }
};

const Container = withSuppressRevealEvents(styled.div`
  zindex: 1000px;
  position: absolute;
  display: block;
  border-radius: 10px;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
  box-shadow: 0px 1px 8px #4f52681a;
  overflow-x: auto;
  overflow-y: auto;
`);

const TreeViewCheckBox = ({
  node,
  onClick
}: {
  node: ITreeNode;
  onClick: NodeAction;
}): ReactElement => {
  if (node.checkedBoxState === CheckBoxState.Hidden) {
    return <></>;
  }
  if (node.checkedBoxState === CheckBoxState.Some) {
    return (
      <Checkbox
        indeterminate={true}
        defaultChecked={true}
        disabled={!node.isEnabled}
        onChange={() => {
          onClick(node);
        }}
      />
    );
  }
  const checked = node.checkedBoxState === CheckBoxState.All;
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

const TreeViewCaret = ({
  node,
  onClick
}: {
  node: ITreeNode;
  onClick: NodeAction;
}): ReactElement => {
  if (!node.isLeaf) {
    const Icon = node.isExpanded ? CaretDownIcon : CaretRightIcon;
    return (
      <Icon
        onClick={() => {
          onClick(node);
        }}
      />
    );
  }
  return <CaretDownIcon style={{ color: 'transparent' }} />;
};

const TreeViewIcon = ({
  node,
  color
}: {
  node: ITreeNode;
  color: string | undefined;
}): ReactElement => {
  const Icon = IconComponentMapper.getIcon(node.icon);
  if (!node.isEnabled) {
    return <Icon style={{ color, marginTop: '3px' }} />;
  }
  return <Icon style={{ marginTop: '3px' }} />;
};

const TreeViewLabel = ({ node }: { node: ITreeNode }): ReactElement => {
  return <span>{node.label}</span>;
};
