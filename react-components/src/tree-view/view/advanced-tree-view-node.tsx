/* eslint-disable react/prop-types */
import { createContext, type ReactElement, useContext, useReducer, useState } from 'react';
import { Colors } from '@cognite/cogs.js';
import { getChildrenAsArray } from './get-children-as-array';
import { type TreeNodeType } from '../model/tree-node-type';
import { type AdvancedTreeViewProps } from './advanced-tree-view-props';
import { HORIZONTAL_SPACING, INDENTATION, VERTICAL_SPACING } from './constants';
import { useOnTreeNodeUpdate } from './use-on-tree-node-update';
import { CustomAdvancedTreeViewNodeContext } from './advanced-tree-view-node.context';

type CustomTreeViewChildDependencies = {
  TreeViewChild: (props: AdvancedTreeViewNodeProps) => ReactElement;
};

export const defaultTreeViewChildDependencies: CustomTreeViewChildDependencies = {
  TreeViewChild: (props) => <AdvancedTreeViewNode {...props} />
};

export const CustomTreeViewChildContext = createContext(defaultTreeViewChildDependencies);

export type AdvancedTreeViewNodeProps = {
  node: TreeNodeType;
  level: number;
  props: AdvancedTreeViewProps;
};

export const AdvancedTreeViewNode = ({
  node: inputNode,
  level,
  props
}: AdvancedTreeViewNodeProps): ReactElement => {
  const [isHover, setHover] = useState(false);
  // This force to update the component when the node changes
  // See https://coreui.io/blog/how-to-force-a-react-component-to-re-render/
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useOnTreeNodeUpdate(inputNode, () => {
    forceUpdate();
  });

  const { TreeViewChild } = useContext(CustomTreeViewChildContext);

  const {
    TreeViewCaret,
    TreeViewCheckbox,
    TreeViewIcon,
    TreeViewInfo,
    TreeViewLabel,
    TreeViewLoadMore,
    TreeViewLoading
    // TreeViewChild
  } = useContext(CustomAdvancedTreeViewNodeContext);

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
          if (hasHover) setHover(true);
        }}
        onMouseLeave={() => {
          if (hasHover) setHover(false);
        }}>
        <TreeViewCaret node={inputNode} />
        {hasCheckboxes && <TreeViewCheckbox node={inputNode} onToggleNode={props.onToggleNode} />}
        <div
          style={{
            flexDirection: 'row',
            display: 'flex',
            gap: horizontalSpacing
          }}
          data-testid="selectable-area" // Used in tests, no other ways to find it
          onClick={(event) => {
            if (props.onSelectNode !== undefined) props.onSelectNode(inputNode);
            event.stopPropagation();
            event.preventDefault();
          }}>
          {props.getIconFromIconName !== undefined && inputNode.icon !== undefined && (
            <TreeViewIcon node={inputNode} getIconFromIconName={props.getIconFromIconName} />
          )}
          {isLoadingChildren && <TreeViewLoading label={props.loadingLabel} />}
          {!isLoadingChildren && (
            <TreeViewLabel node={inputNode} maxLabelLength={props.maxLabelLength} />
          )}
        </div>
        {hasInfo && <TreeViewInfo node={inputNode} onClick={props.onClickInfo} />}
      </div>
      {children !== undefined &&
        children.map((child) => (
          <TreeViewChild node={child} key={child.id} level={level + 1} props={props} />
        ))}
      {hasLoadMore && props.loader !== undefined && (
        <TreeViewLoadMore
          node={inputNode}
          level={level}
          label={props.loadMoreLabel}
          loader={props.loader}
        />
      )}
      {inputNode.isLoadingSiblings === true && (
        <TreeViewLoading level={level} label={props.loadingLabel} />
      )}
    </div>
  );
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
