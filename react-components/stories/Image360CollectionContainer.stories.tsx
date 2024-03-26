/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import {
  type AddImageCollection360Options,
  Image360CollectionContainer,
  useCameraNavigation
} from '../src';
import { Color, Matrix4, Vector3 } from 'three';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { type ReactElement, useRef } from 'react';
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
    collectionId: { siteId: 'c_RC_2', transform: new Matrix4() }
  },
  render: ({ collectionId, styling }) => (
    <RevealStoryContainer color={new Color(0x4a4a4a)}>
      <Image360CollectionContainerStoryContent
        collectionId={collectionId}
        styling={styling}
        transform={collectionId.transform}
      />
    </RevealStoryContainer>
  )
};

type CadModelContainerStoryContentProps = {
  collectionId: AddImageCollection360Options;
  transform?: Matrix4;
  styling?: ImageCollectionModelStyling;
};

const Image360CollectionContainerStoryContent = ({
  collectionId,
  transform,
  styling
}: CadModelContainerStoryContentProps): ReactElement => {
  const modelsLoadedRef = useRef(0);
  const cameraNavigationActions = useCameraNavigation();
  const onLoad = (): void => {
    modelsLoadedRef.current++;
    if (modelsLoadedRef.current === 1) {
      cameraNavigationActions.fitCameraToState({
        position: new Vector3(5, 10, 5),
        target: new Vector3()
      });
      signalStoryReadyForScreenshot();
    }
  };
  return (
    <>
      <Image360CollectionContainer collectionId={collectionId} styling={styling} onLoad={onLoad} />
    </>
  );
};
