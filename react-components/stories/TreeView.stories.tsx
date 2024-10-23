/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer } from '../src';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { TreeView } from '../src/components/Architecture/TreeView/TreeView';
import styled from 'styled-components';
import { type ITreeNode } from '../src/architecture/base/treeView/ITreeNode';
import { TreeNode } from '../src/architecture/base/treeView/TreeNode';
import { getRandomIntByMax } from '../src/architecture/base/utilities/extensions/mathExtensions';
import {
  onSingleSelectNode,
  onAdvancedCheckNode,
  onSimpleCheckNode,
  onMultiSelectNode
} from '../src/architecture/base/treeView/TreeNodeFunctions';
import { CheckBoxState } from '../src/architecture/base/treeView/types';

const meta = {
  title: 'Example/TreeView',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const root1 = createTreeMock(true);
const root2 = createTreeMock(true);
const root3 = createTreeMock(false);

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },
  render: () => {
    return (
      <div>
        <Container
          style={{
            left: '50px',
            width: '300px',
            height: '900px'
          }}>
          <TreeView
            root={root1}
            onSelectNode={onSingleSelectNode}
            onCheckNode={onAdvancedCheckNode}
            loadNodes={loadNodes}
            hasCheckboxes
            hasIcons
          />
        </Container>
        <Container
          style={{
            left: '400px',
            width: '300px',
            height: '900px'
          }}>
          <TreeView
            root={root2}
            onSelectNode={onSingleSelectNode}
            onCheckNode={onSimpleCheckNode}
            loadNodes={loadNodes}
            hasCheckboxes
            hasIcons={false}
          />
        </Container>
        <Container
          style={{
            left: '800px',
            width: '200px',
            height: '900px'
          }}>
          <TreeView
            root={root3}
            onSelectNode={onMultiSelectNode}
            hasCheckboxes={false}
            hasIcons={false}
          />
        </Container>
      </div>
    );
  }
};

const Container = styled.div`
  zindex: 1000;
  position: absolute;
  display: block;
  border-radius: 10px;
  flex-direction: column;
  box-shadow: 0px 1px 8px #4f52681a;
  overflow-x: auto;
  overflow-y: auto;
`;

async function loadNodes(
  _node: ITreeNode,
  _loadChildren: boolean
): Promise<ITreeNode[] | undefined> {
  const promise = new Promise<ITreeNode[]>((resolve) =>
    setTimeout(() => {
      const array: ITreeNode[] = [];
      const totalCount = 123;
      const batchSize = 10;

      for (let i = 0; i < batchSize && i < totalCount; i++) {
        const child = new TreeNode();
        child.label = 'Leaf ' + getRandomIntByMax(1000);
        child.icon = 'Snow';
        child.isExpanded = false;
        child.checkBoxState = CheckBoxState.None;
        child.isEnabled = i % 5 !== 0;
        child.hasBoldLabel = i % 4 === 0;
        child.needLoadSiblings = i === batchSize - 1;
        array.push(child);
      }
      resolve(array);
    }, 2000)
  );
  return await promise;
}

function createTreeMock(lazyLoading: boolean): ITreeNode {
  const root = new TreeNode();
  root.label = 'Root';
  root.isExpanded = true;

  for (let i = 1; i <= 100; i++) {
    const child = new TreeNode();
    child.label = 'Folder ' + i;
    child.isExpanded = true;
    child.icon = 'Snow';
    child.checkBoxState = CheckBoxState.None;
    root.addChild(child);

    for (let j = 1; j <= 10; j++) {
      const child1 = new TreeNode();
      child1.label = 'Child ' + i + '.' + j;
      child1.icon = 'Snow';
      child1.isExpanded = false;
      child1.needLoadChildren = lazyLoading;
      child1.checkBoxState = CheckBoxState.None;
      child1.isEnabled = j !== 2;
      child1.hasBoldLabel = j === 4;

      child.addChild(child1);
    }
  }
  return root;
}
