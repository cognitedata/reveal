/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer, PointsOfInterestSidePanel, RevealButtons, RevealCanvas } from '../src';
import { Color } from 'three';
import { type ReactNode, type ReactElement } from 'react';
import { RevealStoryContext } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { MainToolbar, TopToolbar } from '../src/components/Architecture/Toolbar';
import { useRenderTarget } from '../src/components/RevealCanvas/ViewerContext';
import { type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';
import { ActionList } from '@cognite/cogs-lab';
import { ContextMenu } from '../src/components/ContextMenu';
import { Menu } from '@cognite/cogs.js';
import { ToolUI } from '../src/components/Architecture/ToolUI';
import { type ContextMenuData } from '../src/architecture';

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

const ContextMenuContent = ({
  contextMenuData
}: {
  contextMenuData: ContextMenuData;
}): ReactNode => {
  const point = contextMenuData.intersection?.point;

  return (
    <Menu>
      <ActionList>
        {point !== undefined && (
          <RevealButtons.PointsOfInterestInitiateCreationCommand point={point} />
        )}
      </ActionList>
    </Menu>
  );
};
