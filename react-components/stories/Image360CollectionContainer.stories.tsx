/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import {
  type AddImage360CollectionOptions,
  Image360CollectionContainer,
  useCameraNavigation
} from '../src';
import { Color, Matrix4, Vector3 } from 'three';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { type ReactElement } from 'react';
import { type ImageCollectionModelStyling } from '../src/components/Image360CollectionContainer/useApply360AnnotationStyling';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';

const meta = {
  title: 'Example/PrimitiveWrappers/Image360CollectionContainer',
  component: Image360CollectionContainer,
  tags: ['autodocs']
} satisfies Meta<typeof Image360CollectionContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    addImage360CollectionOptions: { siteId: 'c_RC_2', transform: new Matrix4() }
  },
  render: ({
    addImage360CollectionOptions,
    styling
  }: {
    addImage360CollectionOptions: AddImage360CollectionOptions;
    styling?: ImageCollectionModelStyling;
  }) => (
    <RevealStoryContainer color={new Color(0x4a4a4a)}>
      <Image360CollectionContainerStoryContent
        addImageCollection360Options={addImage360CollectionOptions}
        styling={styling}
      />
    </RevealStoryContainer>
  )
};

type CadModelContainerStoryContentProps = {
  addImageCollection360Options: AddImage360CollectionOptions;
  transform?: Matrix4;
  styling?: ImageCollectionModelStyling;
};

const Image360CollectionContainerStoryContent = ({
  addImageCollection360Options,
  styling
}: CadModelContainerStoryContentProps): ReactElement => {
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
      <Image360CollectionContainer
        addImage360CollectionOptions={addImageCollection360Options}
        styling={styling}
        onLoad={onLoad}
      />
    </>
  );
};
