import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  Image360CollectionContainer,
  PointCloudContainer,
  RevealButtons,
  RevealCanvas
} from '../src';
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
import { PointsOfInterestSidePanel } from '../src/components/Architecture/pointsOfInterest/PointsOfInterestSidePanel';

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
    const pointCloudModelOptions = getAddModelOptionsFromUrl('/pointcloud');
    return (
      <RevealStoryContext color={new Color(0x4a4a4a)} viewerOptions={{}}>
        <PointsOfInterestSidePanel>
          <RevealCanvas>
            <StoryContent
              cadModelOptions={addModelOptions}
              pointCloudModelOptions={pointCloudModelOptions}
            />
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

function StoryContent({
  cadModelOptions,
  pointCloudModelOptions
}: {
  cadModelOptions: AddModelOptions;
  pointCloudModelOptions: AddModelOptions;
}): ReactElement {
  const renderTarget = useRenderTarget();
  return (
    <>
      <CadModelContainer
        addModelOptions={cadModelOptions}
        onLoad={(_model: CogniteCadModel) => {
          renderTarget.onStartup();
        }}
      />
      <PointCloudContainer addModelOptions={pointCloudModelOptions} />
      <Image360CollectionContainer
        addImage360CollectionOptions={{
          externalId: 'site-3677334624356151-592500802548857',
          space: 'threed_data',
          source: 'dm'
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
          <RevealButtons.PointsOfInterestInitiateCreation
            point={point}
            clickEvent={contextMenuData.clickEvent}
          />
        )}
      </ActionList>
    </Menu>
  );
};
