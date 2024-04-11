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
  type DmsUniqueIdentifier,
  RevealToolbar
} from '../src';
import { Color } from 'three';
import { type ReactElement, useEffect, useState } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { RevealStoryContext } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { RuleBasedOutputsButton } from '../src/components/RevealToolbar/RuleBasedOutputsButton';
import { SelectSceneButton } from '../src/components/RevealToolbar/SelectSceneButton';

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
    <RevealStoryContext viewerOptions={{ useFlexibleCameraManager: true }} color={new Color(0x4a4a4a)}>
      <RevealTopbar topbarContent={<TopbarContent />} />
      <RevealCanvas>
        <FitToUrlCameraState />
        <CadModelContainer addModelOptions={addModelOptions} />
      </RevealCanvas>
    </RevealStoryContext>
  )
};

const TopbarContent = (): ReactElement => {
  const [scene, setScene] = useState<DmsUniqueIdentifier>();

  return (
    <>
      <SelectSceneButton selectedScene={scene} setSelectedScene={setScene} orientation="horizontal" />
      <RevealToolbar.SetOrbitOrFirstPersonControlsType orientation="horizontal" />
      <RevealToolbar.LayersButton storeStateInUrl={true} />
      <RuleBasedOutputsButton />
      <RevealToolbar.HelpButton />
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
