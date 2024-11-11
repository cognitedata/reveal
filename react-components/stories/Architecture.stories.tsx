/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  ClickedNodeData,
  PointsOfInterestSidePanel,
  RevealButtons,
  RevealCanvas
} from '../src';
import { Color, Vector2, Vector3 } from 'three';
import { useCallback, useMemo, type ReactElement } from 'react';
import { RevealStoryContainer, RevealStoryContext } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { DomainObjectPanel } from '../src/components/Architecture/DomainObjectPanel';
import { ActiveToolToolbar, MainToolbar, TopToolbar } from '../src/components/Architecture/Toolbar';
import { useRenderTarget, useReveal } from '../src/components/RevealCanvas/ViewerContext';
import { type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';
import { ActionList } from '@cognite/cogs-lab';
import { ContextMenu } from '../src/components/ContextMenu';
import styled from 'styled-components';
import { PointsOfInterestTool } from '../src/architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { Menu } from '@cognite/cogs.js';
import { getClickedNodeDataIntersectionPosition } from '../src/hooks/useClickedNode';
import { getDefaultCommand } from '../src/components/Architecture/utilities';
import { ToolUI } from '../src/components/Architecture/ToolUI';
import { createButtonFromCommandConstructor } from '../src/components/Architecture/CommandButtons';
import { InitiatePointsOfInterestCommand } from '../src/architecture/concrete/pointsOfInterest/InitiatePointsOfInterestCommand';
import { ContextMenuData } from '../src/architecture/base/renderTarget/CommandsController';

const meta = {
  title: 'Example/Architecture',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },
  render: ({ addModelOptions }: { addModelOptions: AddModelOptions }) => {
    return (
      <RevealStoryContext color={new Color(0x4a4a4a)} viewerOptions={{}}>
        <PointsOfInterestSidePanel>
          <RevealCanvas>
            <StoryContent addModelOptions={addModelOptions} />
          </RevealCanvas>
        </PointsOfInterestSidePanel>
        <MainToolbar />
        <TopToolbar />
        <ToolUI />
        <ContextMenu Content={ContextMenuContent} />
      </RevealStoryContext>
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

const ContextMenuContent = ({ contextMenuData }: { contextMenuData: ContextMenuData }) => {
  const point = contextMenuData.intersection?.point;
  return (
    <Menu>
      <ActionList>
        {<RevealButtons.PointsOfInterestInitiateCreationCommand point={point} />}
      </ActionList>
    </Menu>
  );
};
