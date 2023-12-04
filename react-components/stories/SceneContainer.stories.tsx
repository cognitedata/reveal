/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { SceneContainer } from '../src/components/SceneContainer/SceneContainer';
import { Color } from 'three';
import { type ReactElement } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';

const meta = {
  title: 'Example/PrimitiveWrappers/SceneContainer',
  component: SceneContainer,
  tags: ['autodocs']
} satisfies Meta<typeof SceneContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    sceneExternalId: '<scene_external_id>',
    sceneSpaceId: '<scene_space_id>',
    sdk: sdk
  },
  render: ({ sceneExternalId, sceneSpaceId }) => {
    return (
      <RevealStoryContainer color={new Color(0x4a4a4a)}>
        <SceneContainerStoryContent sceneExternalId={sceneExternalId} sceneSpaceId={sceneSpaceId} />
      </RevealStoryContainer>
    );
  }
};

type SceneContainerStoryContentProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
};

const SceneContainerStoryContent = ({
  sceneExternalId,
  sceneSpaceId
}: SceneContainerStoryContentProps): ReactElement => {
  return (
    <>
      <SceneContainer sceneExternalId="" sceneSpaceId="" sdk={sdk} />
    </>
  );
};
