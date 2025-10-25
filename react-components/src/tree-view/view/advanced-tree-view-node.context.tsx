import { createContext, type ReactElement } from 'react';
import { TreeViewCaret, type TreeViewCaretProps } from './components/tree-view-caret';
import { TreeViewCheckbox, type TreeViewCheckboxProps } from './components/tree-view-checkbox';
import { TreeViewIcon, type TreeViewIconProps } from './components/tree-view-icon';
import { TreeViewInfo, type TreeViewInfoProps } from './components/tree-view-info';
import { TreeViewLabel, type TreeViewLabelProps } from './components/tree-view-label';
import { TreeViewLoadMore, type TreeViewLoadMoreProps } from './components/tree-view-load-more';
import { TreeViewLoading, type TreeViewLoadingProps } from './components/tree-view-loading';
// import { AdvancedTreeViewNode, type AdvancedTreeViewNodeProps } from './advanced-tree-view-node';

type CustomAdvancedTreeViewNodeDependencies = {
  TreeViewCaret: (props: TreeViewCaretProps) => ReactElement;
  TreeViewCheckbox: (props: TreeViewCheckboxProps) => ReactElement;
  TreeViewIcon: (props: TreeViewIconProps) => ReactElement;
  TreeViewInfo: (props: TreeViewInfoProps) => ReactElement;
  TreeViewLabel: (props: TreeViewLabelProps) => ReactElement;
  TreeViewLoadMore: (props: TreeViewLoadMoreProps) => ReactElement;
  TreeViewLoading: (props: TreeViewLoadingProps) => ReactElement;
  // TreeViewChild: (props: AdvancedTreeViewNodeProps) => ReactElement;
};

export const defaultAdvancedTreeViewNodeDependencies: CustomAdvancedTreeViewNodeDependencies = {
  TreeViewCaret: (props) => <TreeViewCaret {...props} />,
  TreeViewCheckbox: (props) => <TreeViewCheckbox {...props} />,
  TreeViewIcon: (props) => <TreeViewIcon {...props} />,
  TreeViewInfo: (props) => <TreeViewInfo {...props} />,
  TreeViewLabel: (props) => <TreeViewLabel {...props} />,
  TreeViewLoadMore: (props) => <TreeViewLoadMore {...props} />,
  TreeViewLoading: (props) => <TreeViewLoading {...props} />
  // TreeViewChild: (props) => <AdvancedTreeViewNode {...props} />
};

export const CustomAdvancedTreeViewNodeContext = createContext(
  defaultAdvancedTreeViewNodeDependencies
);
