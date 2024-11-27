/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { RevealStoryContainer } from './utilities/RevealStoryContainer';
import { SceneContainer } from '../src/components/SceneContainer/SceneContainer';
import { Color } from 'three';
import { useEffect, type ReactElement, useState } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import {
  type DefaultResourceStyling,
  type DmsUniqueIdentifier,
  RevealToolbar,
  useReveal,
  useSceneDefaultCamera,
  withSuppressRevealEvents
} from '../src';
import { ToolBar } from '@cognite/cogs.js';
import styled from 'styled-components';
import SearchComponent from './utilities/SearchComponent';

const meta = {
  title: 'Example/PrimitiveWrappers/SceneContainer',
  component: SceneContainer,
  tags: ['autodocs']
} satisfies Meta<typeof SceneContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

const MyCustomToolbar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute !important;
  right: 20px;
  top: 70px;
`;

export const Main: Story = {
  args: {
    sceneExternalId: '92748157-a77e-4163-baa0-64886edad458',
    sceneSpaceId: 'test3d',
    defaultResourceStyling: {
      pointcloud: {
        default: {
          color: new Color('#efefef')
        },
        mapped: {
          color: new Color('#c5cbff')
        }
      }
    }
  },
  render: ({
    sceneExternalId,
    sceneSpaceId,
    defaultResourceStyling
  }: {
    sceneExternalId: string;
    sceneSpaceId: string;
    defaultResourceStyling?: DefaultResourceStyling;
  }) => {
    const [selectedScene, setSelectedScene] = useState<DmsUniqueIdentifier | undefined>(undefined);
    return (
      <RevealStoryContainer color={new Color(0x4a4a4a)} sdk={sdk} useCoreDm>
        <MyCustomToolbar>
          <RevealToolbar.ResetCameraButton
            sceneExternalId={selectedScene?.externalId}
            sceneSpaceId={selectedScene?.space}
          />
          <RevealToolbar.SelectSceneButton
            selectedScene={selectedScene}
            setSelectedScene={setSelectedScene}
          />
          <RevealToolbar.FitModelsButton />
        </MyCustomToolbar>
        <SceneContainerStoryContent
          sceneExternalId={
            selectedScene !== undefined ? selectedScene?.externalId : sceneExternalId
          }
          sceneSpaceId={selectedScene !== undefined ? selectedScene?.space : sceneSpaceId}
          defaultResourceStyling={defaultResourceStyling}
        />
      </RevealStoryContainer>
    );
  }
};

type SceneContainerStoryContentProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
  defaultResourceStyling?: DefaultResourceStyling;
};

const SceneContainerStoryContent = ({
  sceneExternalId,
  sceneSpaceId,
  defaultResourceStyling
}: SceneContainerStoryContentProps): ReactElement => {
  const reveal = useReveal();
  const { fitCameraToSceneDefault } = useSceneDefaultCamera(sceneExternalId, sceneSpaceId);
  useEffect(() => {
    fitCameraToSceneDefault();
  }, [reveal, fitCameraToSceneDefault]);
  return (
    <>
      <SceneContainer
        sceneExternalId={sceneExternalId}
        sceneSpaceId={sceneSpaceId}
        defaultResourceStyling={defaultResourceStyling}
      />
      <SearchComponent sceneExternalId={sceneExternalId} sceneSpaceId={sceneSpaceId} sdk={sdk} />
    </>
  );
};
