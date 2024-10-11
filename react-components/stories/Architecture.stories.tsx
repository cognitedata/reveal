/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer } from '../src';
import { Color } from 'three';
import { type ReactElement } from 'react';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { DomainObjectPanel } from '../src/components/Architecture/DomainObjectPanel';
import { ActiveToolToolbar, MainToolbar, TopToolbar } from '../src/components/Architecture/Toolbar';
import { useRenderTarget } from '../src/components/RevealCanvas/ViewerContext';
import { type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';
import { TreeView } from '../src/components/Architecture/TreeView/TreeView';
import { createMock, TreeNode } from '../src/components/Architecture/TreeView/TreeNode';
import { CheckBoxState, type ITreeNode } from '../src/components/Architecture/TreeView/ITreeNode';

const meta = {
  title: 'Example/Architecture',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const root = createMock();

const onSelect = (node: ITreeNode): boolean => {
  if (!(node instanceof TreeNode)) {
    return false;
  }
  for (const child of root.getThisAndDescendants()) {
    if (child !== node) {
      child.isSelected = false;
    }
  }
  node.isSelected = !node.isSelected;
  return true;
};

const onCheck = (node: ITreeNode): boolean => {
  if (!(node instanceof TreeNode)) {
    return false;
  }
  if (node.checkedBoxState === CheckBoxState.All) {
    node.checkedBoxState = CheckBoxState.None;
  } else {
    node.checkedBoxState = CheckBoxState.All;
  }
  for (const child of node.getDescendants()) {
    if (child.checkedBoxState !== CheckBoxState.Hidden && child.isEnabled) {
      child.checkedBoxState = node.checkedBoxState;
    }
  }
  for (const ancestor of node.getAncestors()) {
    ancestor.checkedBoxState = ancestor.calculateCheckBoxState();
  }
  return true;
};

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },
  render: ({ addModelOptions }: { addModelOptions: AddModelOptions }) => {
    return (
      <RevealStoryContainer color={new Color(0x4a4a4a)} viewerOptions={{}}>
        <StoryContent addModelOptions={addModelOptions} />
        <MainToolbar />
        <TopToolbar />
        <ActiveToolToolbar />
        <DomainObjectPanel />
        <TreeView root={root} onSelect={onSelect} onCheck={onCheck} />
      </RevealStoryContainer>
    );
  }
};

function StoryContent({ addModelOptions }: { addModelOptions: AddModelOptions }): ReactElement {
  const renderTarget = useRenderTarget();
  return (
    <>
      <CadModelContainer
        addModelOptions={addModelOptions}
        onLoad={(_model: CogniteCadModel) => {
          renderTarget.onStartup();
        }}
      />
    </>
  );
}
