/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  CadModelContainer,
  RevealToolbar,
  withSuppressRevealEvents,
  withCameraStateUrlParam,
  useGetCameraStateFromUrlParam,
  useCameraNavigation,
  Reveal3DResources,
  type AddReveal3DModelOptions
} from '../src';
import { Color } from 'three';
import styled from 'styled-components';
import { Button, Dropdown, Menu, ToolBar, type ToolBarButton } from '@cognite/cogs.js';
import { type ReactElement, useEffect, useState } from 'react';
import { signalStoryReadyForScreenshot } from './utilities/signalStoryReadyForScreenshot';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { getAddModelOptionsFromUrl } from './utilities/getAddModelOptionsFromUrl';
import { use3dScenes } from '../src/hooks/use3dScenes';

const meta = {
  title: 'Example/SceneSelector',
  component: CadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const MyCustomToolbar = styled(withSuppressRevealEvents(withCameraStateUrlParam(ToolBar)))`
  position: absolute;
  left: 20px;
  top: 70px;
`;

const exampleToolBarButtons: ToolBarButton[] = [
  {
    icon: 'Edit'
  },
  {
    icon: 'World'
  }
];

const SceneButton = ({
  setResources
}: {
  setResources: (value: AddReveal3DModelOptions[]) => void;
}): ReactElement => {
  const { data } = use3dScenes();
  const [selectedScene, setSelectedScene] = useState(Object.keys(data ?? {})[0]);

  useEffect(() => {
    if (data === undefined) return;

    setResources(data[selectedScene]);

    return () => {
      setResources([]);
    };
  }, [selectedScene]);

  return (
    <Dropdown
      placement="right-start"
      content={
        <Menu>
          <Menu.Header>Select 3D location</Menu.Header>
          {Object.keys(data ?? {}).map((scene) => {
            if (data === undefined) return <></>;

            return (
              <Menu.Item
                key={scene}
                toggled={selectedScene === scene}
                onClick={() => {
                  setSelectedScene(scene);
                }}>
                {scene}
              </Menu.Item>
            );
          })}
        </Menu>
      }>
      <Button icon="World" type="ghost" />
    </Dropdown>
  );
};

export const Main: Story = {
  args: {
    addModelOptions: getAddModelOptionsFromUrl('/primitives')
  },
  render: () => {
    const [resources, setResources] = useState<AddReveal3DModelOptions[]>([]);

    return (
      <RevealStoryContainer color={new Color(0x4a4a4a)}>
        <FitToUrlCameraState />
        <MyCustomToolbar>
          <SceneButton setResources={setResources} />
          <RevealToolbar.FitModelsButton />
          <ToolBar.ButtonGroup buttonGroup={exampleToolBarButtons} />
          <RevealToolbar.SlicerButton />
        </MyCustomToolbar>
        <Reveal3DResources resources={resources} />
      </RevealStoryContainer>
    );
  }
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
