import { createContext, type ReactElement } from 'react';
import { AdvancedTreeViewNode, type AdvancedTreeViewNodeProps } from './advanced-tree-view-node';
import { Loader, type LoaderProps } from '@cognite/cogs.js';

type CustomAdvancedTreeViewDependencies = {
  Loader: (props: LoaderProps) => ReactElement;
  AdvancedTreeViewNode: (props: AdvancedTreeViewNodeProps) => ReactElement;
};

export const defaultAdvancedTreeViewDependencies: CustomAdvancedTreeViewDependencies = {
  Loader: (props) => <Loader {...props} />,
  AdvancedTreeViewNode: (props) => <AdvancedTreeViewNode {...props} />
};

export const CustomAdvancedTreeViewContext = createContext(defaultAdvancedTreeViewDependencies);
