import { createContext, type ReactElement } from 'react';
import { TreeViewCaret } from './components/tree-view-caret';
import { type TreeNodeType } from '../model/tree-node-type';
import { TreeViewCheckbox } from './components/tree-view-checkbox';
import { type TreeNodeAction } from '../model/types';
import { type GetIconFromIconNameFn } from './advanced-tree-view-props';
import { TreeViewIcon } from './components/tree-view-icon';
import { TreeViewInfo } from './components/tree-view-info';
import { TreeViewLabel } from './components/tree-view-label';
import { type ILazyLoader } from '../model/i-lazy-loader';
import { TreeViewLoadMore } from './components/tree-view-load-more';
import { TreeViewLoading } from './components/tree-view-loading';
import { AdvancedTreeViewNode, type AdvancedTreeViewNodeProps } from './advanced-tree-view-node';

type TreeViewCaretProps = {
  node: TreeNodeType;
};

type TreeViewCheckboxProps = {
  node: TreeNodeType;
  onToggleNode?: TreeNodeAction;
};

type TreeViewIconProps = {
  node: TreeNodeType;
  getIconFromIconName: GetIconFromIconNameFn;
};

type TreeViewInfoProps = {
  node: TreeNodeType;
  onClick?: TreeNodeAction;
};

type TreeViewLabelProps = {
  node: TreeNodeType;
  maxLabelLength?: number;
};

type TreeViewLoadMoreProps = {
  node: TreeNodeType;
  level: number;
  label?: string;
  loader: ILazyLoader;
};

type TreeViewLoadingProps = {
  level?: number;
  label?: string;
};

export type CustomInputFieldDependencies = {
  TreeViewCaret: (props: TreeViewCaretProps) => ReactElement;
  TreeViewCheckbox: (props: TreeViewCheckboxProps) => ReactElement;
  TreeViewIcon: (props: TreeViewIconProps) => ReactElement;
  TreeViewInfo: (props: TreeViewInfoProps) => ReactElement;
  TreeViewLabel: (props: TreeViewLabelProps) => ReactElement;
  TreeViewLoadMore: (props: TreeViewLoadMoreProps) => ReactElement;
  TreeViewLoading: (props: TreeViewLoadingProps) => ReactElement;
  TreeViewChild: (props: AdvancedTreeViewNodeProps) => ReactElement;
};

export const defaultAdvancedTreeViewNodeDependencies: CustomInputFieldDependencies = {
  TreeViewCaret: (props) => <TreeViewCaret {...props} />,
  TreeViewCheckbox: (props) => <TreeViewCheckbox {...props} />,
  TreeViewIcon: (props) => <TreeViewIcon {...props} />,
  TreeViewInfo: (props) => <TreeViewInfo {...props} />,
  TreeViewLabel: (props) => <TreeViewLabel {...props} />,
  TreeViewLoadMore: (props) => <TreeViewLoadMore {...props} />,
  TreeViewLoading: (props) => <TreeViewLoading {...props} />,
  TreeViewChild: (props) => <AdvancedTreeViewNode {...props} />
};

export const CustomAdvancedTreeViewNodeContext = createContext(
  defaultAdvancedTreeViewNodeDependencies
);
