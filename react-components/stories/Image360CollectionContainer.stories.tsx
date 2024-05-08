/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useCameraNavigation, Reveal3DResources, type Reveal3DResourcesProps } from '../src';
import { Color, Matrix4, Vector3 } from 'three';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { type ReactElement } from 'react';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';

const meta = {
  title: 'Example/PrimitiveWrappers/Image360CollectionContainer',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    resources: [{ siteId: 'c_RC_2', transform: new Matrix4() }]
  },
  render: ({ resources }) => (
    <RevealStoryContainer color={new Color(0x4a4a4a)}>
      <Image360CollectionContainerStoryContent resources={resources} />
    </RevealStoryContainer>
  )
};

const Image360CollectionContainerStoryContent = ({
  resources
}: Reveal3DResourcesProps): ReactElement => {
  const cameraNavigationActions = useCameraNavigation();
  const onLoad = (): void => {
    cameraNavigationActions.fitCameraToState({
      position: new Vector3(5, 10, 5),
      target: new Vector3()
    });
    signalStoryReadyForScreenshot();
  };
  return (
    <>
      <Reveal3DResources resources={resources} onResourcesAdded={onLoad} />
    </>
  );
};
