/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer, TreeView } from '../src';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import styled from 'styled-components';
import { type ITreeNode } from '../src/architecture/base/treeView/ITreeNode';
import {
  onSingleSelectNode,
  onDependentCheckNode
} from '../src/architecture/base/treeView/TreeNodeFunctions';
import { Button } from '@cognite/cogs.js';
import { useEffect, useRef, useState } from 'react';
import { CadTreeNode } from '../src/architecture/base/treeView/cadTreeView/CadTreeNode';
import {
  getId,
  scrollToNode,
  scrollToTreeIndex
} from '../src/components/Architecture/CadTreeView/cadTreeViewUtils';
import { type SubsetOfNode3D } from '../src/architecture/base/treeView/cadTreeView/types';
import { getRandomIntByMax } from '../src/architecture/base/utilities/extensions/mathExtensions';

let id = 1000;
let treeIndex = 5000;

function createNode(name: string): CadTreeNode {
  id++;
  treeIndex++;
  name = `${name} ${id} ${treeIndex}`;
  const node = new CadTreeNode({ id, treeIndex, name });
  node.isExpanded = true;
  return node;
}

const meta = {
  title: 'Example/CadTreeView',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },

  render: () => {
    const root = createTreeMock(true);
    const myRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, _setScrollPosition] = useState(-1);

    useEffect(() => {
      if (scrollPosition !== -1) {
        scrollToTreeIndex(myRef?.current ?? undefined, scrollPosition);
      }
    }, [scrollPosition]);

    return (
      <div>
        <Button
          onClick={() => {
            scroll(myRef?.current ?? undefined, root, true);
          }}>
          Scroll to first
        </Button>
        <Button
          onClick={() => {
            scroll(myRef?.current ?? undefined, root, false);
          }}>
          Scroll to last
        </Button>
        <Button
          onClick={() => {
            testInsert(myRef?.current ?? undefined, root);
          }}>
          Test Insert
        </Button>
        <Container
          ref={myRef}
          style={{
            left: '50px',
            width: '300px',
            height: '500px'
          }}>
          <TreeView
            root={root}
            onSelectNode={onSingleSelectNode}
            onCheckNode={onDependentCheckNode}
            loadNodes={loadNodes}
            hasCheckboxes
            hasIcons
            hasInfo
            getId={getId}
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
        const child = createNode('loaded');
        array.push(child);
        child.needLoadSiblings = i === batchSize - 1;
      }
      resolve(array);
    }, 2000)
  );
  return await promise;
}

function createTreeMock(lazyLoading: boolean): CadTreeNode {
  const root = createNode('root');

  for (let i = 1; i <= 10; i++) {
    const parent = createNode('folder');
    root.addChild(parent);

    for (let j = 1; j <= 10; j++) {
      const child = createNode('child');
      parent.addChild(child);
      child.needLoadChildren = lazyLoading && j === 10;
    }
  }
  return root;
}

function scroll(container: HTMLElement | undefined, root: CadTreeNode, isFirst: boolean): void {
  if (container === undefined) {
    return;
  }
  root.deselectAll();
  let lastNode = root;
  if (!isFirst) {
    for (const node of root.getThisAndDescendantsByType(CadTreeNode)) {
      lastNode = node;
    }
  }
  lastNode.isSelected = true;
  scrollToNode(container, lastNode);
}

function testInsert(container: HTMLElement | undefined, root: CadTreeNode): void {
  if (container === undefined) {
    return;
  }
  const allNodes = Array.from(root.getDescendants());

  const index = getRandomIntByMax(allNodes.length);
  const target = allNodes[index];
  const newNodes: SubsetOfNode3D[] = [];
  for (const ancestor of target.getAncestorsByType(CadTreeNode)) {
    newNodes.push({ name: ancestor.label, id: ancestor.id, treeIndex: ancestor.treeIndex });
  }
  newNodes.reverse();
  const newNode = createNode('Inserted');
  newNodes.push({ name: newNode.label, id: newNode.id, treeIndex: newNode.treeIndex });
  root.deselectAll();
  root.insertAncestors(newNodes);

  const insertedNode = root.getDescendantByNodeId(newNode.id);
  if (insertedNode === undefined) {
    return;
  }
  scrollToTreeIndex(container, insertedNode.treeIndex);
  insertedNode.isSelected = true;
}
