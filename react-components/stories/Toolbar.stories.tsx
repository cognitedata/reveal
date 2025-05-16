/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  RevealToolbar,
  withSuppressRevealEvents,
  useCameraNavigation,
  RevealButtons
} from '../src';
import { Color } from 'three';
import styled from 'styled-components';
import { EditIcon, ToolBar, WorldIcon, type ToolBarButton } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
import { type ReactElement, useState, useEffect } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { useGetCameraStateFromUrlParam } from './utilities/useGetCameraStateFromUrlParam';
import { type AddModelOptions } from '@cognite/reveal';
import { LayersButtonStrip } from '../src/components/RevealToolbar/LayersButton/components/LayersButtonsStrip';
import { type QualitySettings } from '../src/architecture';

const meta = {
  title: 'Example/Toolbar',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const MyCustomToolbar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute !important;
  right: 20px;
  top: 70px;
`;

const exampleToolBarButtons: ToolBarButton[] = [
  {
    icon: <EditIcon />
  },
  {
    icon: <WorldIcon />
  }
];

const exampleCustomSettingElements = (): ReactElement => {
  const [originalCadColor, setOriginalCadColor] = useState(false);

  return (
    <>
      <Menu.ItemToggled
        toggled={originalCadColor}
        onClick={() => {
          setOriginalCadColor((prevMode) => !prevMode);
        }}
        label="Original CAD coloring"></Menu.ItemToggled>
    </>
  );
};

const exampleHighQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 95_000_000,
    highDetailProximityThreshold: 100
  },
  pointCloudBudget: {
    numberOfPoints: 12_000_000
  },
  resolutionOptions: {
    maxRenderResolution: Infinity,
    movingCameraResolutionFactor: 1
  }
};

const exampleLowQualitySettings: QualitySettings = {
  cadBudget: {
    maximumRenderCost: 10_000_000,
    highDetailProximityThreshold: 100
  },
  pointCloudBudget: {
    numberOfPoints: 2_000_000
  },
  resolutionOptions: {
    maxRenderResolution: 1e5,
    movingCameraResolutionFactor: 1
  }
};

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },
  render: ({ addModelOptions }: { addModelOptions: AddModelOptions }) => (
    <RevealStoryContainer color={new Color(0x4a4a4a)} viewerOptions={{}}>
      <FitToUrlCameraState />
      <CadModelContainer addModelOptions={addModelOptions} />
      <RevealToolbar
        customSettingsContent={exampleCustomSettingElements()}
        lowFidelitySettings={exampleLowQualitySettings}
        highFidelitySettings={exampleHighQualitySettings}
      />
      <TopToolBar>
        <LayersButtonStrip />
      </TopToolBar>
      <MyCustomToolbar>
        <RevealToolbar.FitModelsButton />
        <ToolBar.ButtonGroup buttonGroup={exampleToolBarButtons} />
        <RevealButtons.SetOrbitOrFirstPersonMode toolbarPlacement="top" />
        <RevealToolbar.SlicerButton />
      </MyCustomToolbar>
    </RevealStoryContainer>
  )
};

export const TopToolBar = styled(withSuppressRevealEvents(ToolBar)).attrs({
  direction: 'horizontal'
})`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translate(-50%, 0%);
  height: 48px;
  padding: 6px;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid rgba(83, 88, 127, 0.24);
`;

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
