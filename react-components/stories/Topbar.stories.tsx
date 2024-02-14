/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  useGetCameraStateFromUrlParam,
  useCameraNavigation,
  RevealTopbar,
  RevealCanvas
} from '../src';
import { Color } from 'three';
import { type ReactElement, useEffect } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { RevealStoryContainer, RevealStoryContext } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';

const meta = {
  title: 'Example/Topbar',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },
  render: ({ addModelOptions }) => (
    <RevealStoryContext color={new Color(0x4a4a4a)}>
      <RevealTopbar />
      <RevealCanvas />
      <FitToUrlCameraState />
      <CadModelContainer addModelOptions={addModelOptions} />
    </RevealStoryContext>
  )
};

function FitToUrlCameraState(): ReactElement {
  const getCameraState = useGetCameraStateFromUrlParam();
  const cameraNavigation = useCameraNavigation();

  useEffect(() => {
    signalStoryReadyForScreenshot();
    const currentCameraState = getCameraState();
    if (currentCameraState === undefined) return;
    cameraNavigation.fitCameraToState(currentCameraState);
  }, []);

  return <></>;
}
