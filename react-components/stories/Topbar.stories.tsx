/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  useCameraNavigation,
  RevealTopbar,
  RevealCanvas,
  Reveal3DResources,
  AddResourceOptions
} from '../src';
import { Color, Matrix4 } from 'three';
import { type ReactElement, useEffect } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { RevealStoryContext } from './utilities/RevealStoryContainer';
import { useGetCameraStateFromUrlParam } from './utilities/useGetCameraStateFromUrlParam';

const meta = {
  title: 'Example/Topbar',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 1791160622840317,
        revisionId: 498427137020189,
        transform: new Matrix4().makeTranslation(40, 0, 0)
      },
      {
        modelId: 1791160622840317,
        revisionId: 498427137020189,
        transform: new Matrix4().makeTranslation(40, 10, 0)
      },
      {
        siteId: 'c_RC_2'
      },
      {
        modelId: 3865289545346058,
        revisionId: 4160448151596909
      }
    ]
  },
  render: ({ resources }: { resources: AddResourceOptions[] }) => (
    <RevealStoryContext viewerOptions={{}} color={new Color(0x4a4a4a)}>
      <RevealTopbar />
      <RevealCanvas>
        <Reveal3DResources resources={resources} />
        <FitToUrlCameraState />
      </RevealCanvas>
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
