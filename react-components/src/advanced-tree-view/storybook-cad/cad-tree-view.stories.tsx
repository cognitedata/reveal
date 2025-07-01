import React, { useRef } from 'react';

import styled from 'styled-components';

import { type Meta, type StoryObj } from '@storybook/react';

import { Button } from '@cognite/cogs.js';

import {
  AdvancedTreeView,
  onRecursiveToggleNode,
  onSingleSelectNode,
  scrollToFirst,
  scrollToLast,
  scrollToNode
} from '..';

import { CadNodesLoader } from './cad-nodes-loader';
import { CogniteClientMock } from './cognite-client-mock';

// Note: This simulate the behavior of the real CadTreeNode. Can not use it here
// because of not connection to CDF.

const meta: Meta<typeof AdvancedTreeView> = {
  component: AdvancedTreeView,
  title: 'Components / AdvancedTreeView (Cad)'
};

type Story = StoryObj<typeof AdvancedTreeView>;

export default meta;

const sdk = new CogniteClientMock();
const baseLoader = new CadNodesLoader(sdk, { revisionId: 1, modelId: 1 }, 10);

export const base: Story = {
  name: 'base',
  render: () => {
    return (
      <AdvancedTreeView
        onSelectNode={onSingleSelectNode}
        onToggleNode={onRecursiveToggleNode}
        loader={baseLoader}
        hasCheckboxes
        showRoot
      />
    );
  }
};

const loader = new CadNodesLoader(sdk, { revisionId: 1, modelId: 1 }, 10);

export const Main: Story = {
  name: 'main',
  render: () => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
      <div
        style={{
          gap: '8px',
          padding: '8px'
        }}>
        <StyledButton
          size="small"
          onClick={() => {
            scrollToFirst(containerRef?.current ?? undefined, loader.root);
          }}>
          Scroll to first
        </StyledButton>
        <StyledButton
          size="small"
          onClick={() => {
            scrollToLast(containerRef?.current ?? undefined, loader.root);
          }}>
          Scroll to last
        </StyledButton>
        <StyledButton
          size="small"
          onClick={async () => {
            const nodeId = sdk.getRandomNodeId();
            await loader.forceNodeInTree(nodeId).then((selectedNode) => {
              if (selectedNode === undefined) {
                return;
              }
              onSingleSelectNode(selectedNode);
              scrollToNode(containerRef?.current ?? undefined, selectedNode);
            });
          }}>
          Test Random Insert
        </StyledButton>
        <Container ref={containerRef}>
          <AdvancedTreeView
            loader={loader}
            onSelectNode={onSingleSelectNode}
            onToggleNode={onRecursiveToggleNode}
            hasCheckboxes
            showRoot
          />
        </Container>
      </div>
    );
  }
};

const StyledButton = styled(Button)`
  margin: 8px;
`;

const Container = styled.div`
  z-index: 1000;
  padding: 16px;
  display: flex;
  height: 600px;
  border-radius: 6px;
  box-shadow: 0px 1px 8px #4f52681a;
  overflow-x: auto;
  overflow-y: auto;
`;
