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
import { useRef } from 'react';
import { CadTreeNode } from '../src/architecture/base/treeView/cadTreeView/CadTreeNode';

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

function getId(node: ITreeNode): string {
  if (!(node instanceof CadTreeNode)) {
    return '';
  }
  return node.treeIndex.toString();
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
    return (
      <div>
        <Button
          onClick={() => {
            if (myRef !== undefined && myRef.current !== null) {
              // myRef.current.scrollIntoView({ block: 'end' });
              // myRef.current.scrollTop = 100;
              let lastNode = root;
              for (const node of root.getDescendantsByType(CadTreeNode)) {
                lastNode = node;
              }
              lastNode.isSelected = true;
              console.log(lastNode);
              scrollToNode(myRef.current, lastNode);
            }
          }}>
          Scroll to last
        </Button>

        <Container
          ref={myRef}
          style={{
            left: '50px',
            width: '300px',
            height: '900px'
          }}>
          <TreeView
            root={root}
            onSelectNode={onSingleSelectNode}
            onCheckNode={onDependentCheckNode}
            //loadNodes={loadNodes}
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

function scrollToElement(container: HTMLElement, treeIndex: number): void {
  const id = treeIndex.toString();
  const element = document.getElementById(id);
  if (element === null) {
    return;
  }
  const height = container.offsetHeight;
  const top = element.offsetTop;
  const newTop = top - height / 2;
  if (newTop < 0) {
    return;
  }
  container.scroll({ top: newTop, behavior: 'smooth' });
}

function scrollToNode(container: HTMLElement, node: CadTreeNode): void {
  const id = getId(node);
  const element = document.getElementById(id);
  if (element === null) {
    return;
  }
  const height = container.offsetHeight;
  const top = element.offsetTop;
  const newTop = top - height / 2;
  if (newTop < 0) {
    return;
  }
  container.scroll({ top: newTop, behavior: 'smooth' });
}

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
        //child.needLoadSiblings = i === batchSize - 1;
      }
      resolve(array);
    }, 2000)
  );
  return await promise;
}

function createTreeMock(lazyLoading: boolean): CadTreeNode {
  const root = createNode('root');

  console.log('add', root.label);
  for (let i = 1; i <= 10; i++) {
    const parent = createNode('folder');
    root.addChild(parent);
    console.log('  add', parent.label);
    continue;

    for (let j = 1; j <= 0; j++) {
      const child = createNode('child');
      parent.addChild(child);
      // child.needLoadChildren = lazyLoading && j === 10;
    }
  }
  for (const n of root.getThisAndDescendantsByType(CadTreeNode)) {
    console.log('  ', n.label);
  }
  return root;
}
