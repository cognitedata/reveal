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
  onDependentCheckNode,
  onIndependentCheckNode,
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
            onCheckNode={onDependentCheckNode}
            loadNodes={loadNodes}
            onClickInfo={onClickInfo}
            hasCheckboxes
            hasIcons
            maxLabelLength={4}
            hasInfo
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
            onCheckNode={onIndependentCheckNode}
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
        child.icon = i % 3 === 0 ? 'Cube' : 'CylinderHorizontal';
        child.isExpanded = false;
        child.checkBoxState = CheckBoxState.None;
        child.isEnabled = i % 5 !== 0;
        child.hasBoldLabel = i % 4 === 0;
        child.needLoadSiblings = i === batchSize - 1;
        if (i % 4 === 0) child.iconColor = 'blue';
        if (i % 5 === 0) child.iconColor = 'green';
        if (i % 7 === 0) child.iconColor = 'red';
        array.push(child);
      }
      resolve(array);
    }, 2000)
  );
  return await promise;
}

function createTreeMock(lazyLoading: boolean): TreeNode {
  const root = new TreeNode();
  root.label = 'Root';
  root.isExpanded = true;

  for (let i = 1; i <= 100; i++) {
    const parent = new TreeNode();
    parent.label = 'Folder ' + i;
    parent.isExpanded = true;
    parent.icon = 'Snow';
    parent.checkBoxState = CheckBoxState.None;
    root.addChild(parent);
    if (i % 8 === 0) parent.iconColor = 'blue';
    if (i % 6 === 0) parent.iconColor = 'red';
    parent.icon = i % 2 === 0 ? 'CubeFrontRight' : 'CubeFrontLeft';

    for (let j = 1; j <= 10; j++) {
      const child = new TreeNode();
      child.label = 'Child ' + i + '.' + j;
      switch (j % 3) {
        case 0:
          child.icon = 'CylinderArbitrary';
          break;
        case 1:
          child.icon = 'CylinderHorizontal';
          break;
        case 2:
          child.icon = 'CylinderVertical';
          break;
      }
      child.isExpanded = false;
      child.needLoadChildren = lazyLoading;
      child.checkBoxState = CheckBoxState.None;
      child.isEnabled = j !== 2;
      child.hasBoldLabel = j === 4;
      if (j % 3 === 0) child.iconColor = 'magenta';
      if (j % 5 === 0) child.iconColor = 'green';
      if (j % 7 === 0) child.iconColor = 'blue';
      if (j % 11 === 0) child.iconColor = 'red';

      parent.addChild(child);
    }
  }
  return root;
}

function onClickInfo(_node: ITreeNode): void {
  // console.log('Info clicked: ' + node.label);
}
