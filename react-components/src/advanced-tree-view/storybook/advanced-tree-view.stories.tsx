/*!
 * Copyright 2025 Cognite AS
 */
import React from 'react';

import { type Meta, type StoryObj } from '@storybook/react';

import {
  CopyIcon,
  CubeIcon,
  FlagIcon,
  FolderIcon,
  type IconProps,
  PlaceholderIcon,
  SnowIcon
} from '@cognite/cogs.js';

import {
  onMultiSelectNode,
  onSingleSelectNode,
  onSimpleToggleNode,
  onRecursiveToggleNode
} from '../model/tree-node-functions';
import { type TreeNodeType } from '../model/tree-node-type';
import { type IconName } from '../model/types';
import { AdvancedTreeView } from '../view/advanced-tree-view';

import { createSimpleMock } from './create-simple-mock';
import { LazyLoaderMock } from './lazy-loader-mock';

const meta: Meta<typeof AdvancedTreeView> = {
  component: AdvancedTreeView,
  title: 'Components / AdvancedTreeView'
};

export default meta;

type Story = StoryObj<typeof AdvancedTreeView>;

const baseRoot = createSimpleMock({});
export const base: Story = {
  name: 'base',
  render: () => <AdvancedTreeView root={baseRoot} />
};

const rootWithHiddenRoot = createSimpleMock({});
export const HideRoot: Story = {
  name: 'hide root',
  render: () => <AdvancedTreeView root={rootWithHiddenRoot} showRoot={false} />
};

const rootWithMaxLabelLength = createSimpleMock({});
for (const node of rootWithMaxLabelLength.getThisAndDescendants()) {
  node.label += ' is a very nice place to be';
}

export const MaxLabelLengthRoot: Story = {
  name: 'max label length with tooltip',
  render: () => <AdvancedTreeView root={rootWithMaxLabelLength} maxLabelLength={10} />
};

const rootWithSingleSelect = createSimpleMock({});
export const SingleSelect: Story = {
  name: 'single selection',
  render: () => <AdvancedTreeView root={rootWithSingleSelect} onSelectNode={onSingleSelectNode} />
};

const rootWithMultiSelect = createSimpleMock({});
export const MultiSelect: Story = {
  name: 'multi selection',
  render: () => <AdvancedTreeView root={rootWithMultiSelect} onSelectNode={onMultiSelectNode} />
};

const rootWithSimpleCB = createSimpleMock({ hasCheckboxes: true });
export const SimpleCheckboxes: Story = {
  name: 'simple checkboxes',
  render: () => <AdvancedTreeView root={rootWithSimpleCB} onToggleNode={onSimpleToggleNode} />
};

const rootWithDisabledCB = createSimpleMock({
  hasCheckboxes: true,
  hasDisabledCheckboxes: true
});
export const SimpleCheckboxesWithSomeDisabled: Story = {
  name: 'simple checkboxes, some disabled',
  render: () => <AdvancedTreeView root={rootWithDisabledCB} onToggleNode={onSimpleToggleNode} />
};

const rootWithRecursiveCB = createSimpleMock({ hasCheckboxes: true });
export const RecursiveCheckboxes: Story = {
  name: 'recursive checkboxes',
  render: () => <AdvancedTreeView root={rootWithRecursiveCB} onToggleNode={onRecursiveToggleNode} />
};

const rootWithIcon = createSimpleMock({});
export const WithIcons: Story = {
  name: 'icons',
  render: () => <AdvancedTreeView root={rootWithIcon} getIconFromIconName={getIconFromIconName} />
};

const rootWithColorIcon = createSimpleMock({ hasColors: true });
export const WithColorIcons: Story = {
  name: 'icons and colors',
  render: () => (
    <AdvancedTreeView root={rootWithColorIcon} getIconFromIconName={getIconFromIconName} />
  )
};

const rootWithColorIconBold = createSimpleMock({
  hasColors: true,
  hasBoldLabels: true
});
export const WithBoldLabels: Story = {
  name: 'icons, colors and some bold labels',
  render: () => (
    <AdvancedTreeView root={rootWithColorIconBold} getIconFromIconName={getIconFromIconName} />
  )
};

const infoRoot = createSimpleMock({});
export const WithInfo: Story = {
  name: 'info',
  render: () => <AdvancedTreeView root={infoRoot} onClickInfo={onClickInfo} />
};

const lazyLoaderMock1 = new LazyLoaderMock(true, false, 10);
export const LazyLoading: Story = {
  name: 'lazy loading',
  render: () => <AdvancedTreeView loader={lazyLoaderMock1} />
};

const lazyLoaderMock2 = new LazyLoaderMock(true, true, 10);
export const LazyLoadingWithEverything: Story = {
  name: 'lazy loading with everything',
  render: () => (
    <AdvancedTreeView
      loader={lazyLoaderMock2}
      onSelectNode={onSingleSelectNode}
      onToggleNode={onRecursiveToggleNode}
      onClickInfo={onClickInfo}
      getIconFromIconName={getIconFromIconName}
    />
  )
};

const lazyLoaderMock3 = new LazyLoaderMock(false, false, 100);
export const VeryLargeWithEverything: Story = {
  name: 'tree with 1.000.000 nodes',
  render: () => (
    <AdvancedTreeView
      loader={lazyLoaderMock3}
      onSelectNode={onSingleSelectNode}
      onToggleNode={onRecursiveToggleNode}
      getIconFromIconName={getIconFromIconName}
    />
  )
};

function onClickInfo(node: TreeNodeType): void {
  alert('You clicked: ' + node.label);
}

function getIconFromIconName(icon: IconName): React.FC<IconProps> {
  if (icon === 'Folder') {
    return FolderIcon;
  } else if (icon === 'Cube') {
    return CubeIcon;
  } else if (icon === 'Snow') {
    return SnowIcon;
  } else if (icon === 'Flag') {
    return FlagIcon;
  } else if (icon === 'Copy') {
    return CopyIcon;
  }
  return PlaceholderIcon;
}
