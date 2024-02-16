/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  useGetCameraStateFromUrlParam,
  useCameraNavigation,
  RevealTopbar,
  RevealCanvas,
  type DmsUniqueIdentifier
} from '../src';
import { Color } from 'three';
import { type ReactElement, useEffect, useState } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { RevealStoryContext } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { SceneSelectionDropdown } from '../src/components/RevealTopbar/SceneSelectionDropdown';

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
      <RevealTopbar topbarContent={<TopbarContent />} />
      <RevealCanvas>
        <FitToUrlCameraState />
        <CadModelContainer addModelOptions={addModelOptions} />
      </RevealCanvas>
    </RevealStoryContext>
  )
};

const TopbarContent = () => {
  const [scene, setScene] = useState<DmsUniqueIdentifier>();

  return (
    <>
      <SceneSelectionDropdown selectedScene={scene} setSelectedScene={setScene} />
    </>
  );
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
