/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { SceneContainer } from '../src/components/SceneContainer/SceneContainer';
import { Color } from 'three';
import { type ReactElement } from 'react';

const meta = {
  title: 'Example/PrimitiveWrappers/SceneContainer',
  component: SceneContainer,
  tags: ['autodocs']
} satisfies Meta<typeof SceneContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    sceneExternalId: '<scene_external_id>',
    sceneSpaceId: '<scene_space_id>'
  },
  render: ({ sceneExternalId, sceneSpaceId }) => {
    return (
      <RevealStoryContainer color={new Color(0x4a4a4a)}>
        <SceneContainerStoryContent sceneExternalId={sceneExternalId} sceneSpaceId={sceneSpaceId} />
      </RevealStoryContainer>
    );
  }
};

type CadModelContainerStoryContentProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
};

const SceneContainerStoryContent = ({
  sceneExternalId,
  sceneSpaceId
}: CadModelContainerStoryContentProps): ReactElement => {
  return (
    <>
      <SceneContainer sceneExternalId="" sceneSpaceId="" />
    </>
  );
};
