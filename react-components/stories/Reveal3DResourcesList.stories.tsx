/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResourcesList } from '../src/components/Reveal3DResourcesList/Reveal3DResourcesList';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import styled from 'styled-components';
import { type FC, useState, type ReactElement } from 'react';
import { type ModelWithRevisionInfo } from '../src/hooks/network/types';
import { CadModelContainer } from '../src/components/CadModelContainer';
import { type AddModelOptions } from '@cognite/reveal';
import { Button, LayersIcon, ToolBar } from '@cognite/cogs.js';
import {
  RevealToolbar,
  RevealButtons,
  AxisGizmo,
  ToolUI,
  withSuppressRevealEvents,
  RevealCanvas,
  RevealContext,
  useReveal
} from '../src';
import { Color } from 'three';

const meta = {
  title: 'Example/Reveal3DResourcesList',
  component: Reveal3DResourcesList,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResourcesList>;
export default meta;
type Story = StoryObj<typeof meta>;
const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    sdk,
    modelType: 'CAD',
    selectedModel: undefined,
    setSelectedModel: () => {},
    selectedRevisions: {},
    setSelectedRevisions: () => {}
  },
  render: ({ sdk, modelType }) => {
    const [isResourcesListVisible, setIsResourcesListVisible] = useState(false);
    const viewerOptions = {
      logMetrics: false
    };

    return (
      <RevealContext sdk={sdk} color={new Color(0x4a4a4a)} viewerOptions={viewerOptions}>
        <RevealCanvas>
          <ToolBarUI
            onLayersButtonClick={() => {
              setIsResourcesListVisible((prev) => !prev);
            }}
          />
          <ResourcesAndModelContainer
            isResourcesListVisible={isResourcesListVisible}
            sdk={sdk}
            modelType={modelType ?? ''}
          />
        </RevealCanvas>
      </RevealContext>
    );
  }
};

function ToolBarUI({ onLayersButtonClick }: { onLayersButtonClick: () => void }): ReactElement {
  return (
    <>
      <StyledRevealToolBar>
        <RevealToolbar.SlicerButton />
        <RevealButtons.Clip />
        <RevealButtons.Measurement />
        <RevealButtons.FitView />
        <Button icon={<LayersIcon />} type="ghost" onClick={onLayersButtonClick} />
      </StyledRevealToolBar>
      <AxisGizmo />
      <ToolUI />
    </>
  );
}

const ResourcesAndModelContainer = ({
  isResourcesListVisible,
  sdk,
  modelType
}: {
  isResourcesListVisible: boolean;
  sdk: any;
  modelType: string;
}): ReactElement => {
  const viewer = useReveal();
  const [selectedModel, setSelectedModel] = useState<ModelWithRevisionInfo | undefined>(undefined);
  const [selectedRevisions, setSelectedRevisions] = useState<Record<number, number | undefined>>(
    {}
  );
  const [addModelOptions, setAddModelOptions] = useState<AddModelOptions | undefined>(undefined);

  const handleRevisionSelect = (modelId: number, revisionId: number): void => {
    viewer.models.forEach((model) => {
      viewer.removeModel(model);
    });
    setAddModelOptions({ modelId, revisionId });
  };

  return (
    <>
      {isResourcesListVisible && (
        <StyledContainer>
          <Reveal3DResourcesList
            sdk={sdk}
            modelType={modelType}
            onRevisionSelect={handleRevisionSelect}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedRevisions={selectedRevisions}
            setSelectedRevisions={setSelectedRevisions}
          />
        </StyledContainer>
      )}
      {addModelOptions !== undefined && <CadModelContainer addModelOptions={addModelOptions} />}
    </>
  );
};

const StyledRevealToolBar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute !important;
  left: 16px;
  top: 72px;
`;
const DivComponent: FC = (props) => <div {...props} />;
const StyledContainer = styled(withSuppressRevealEvents(DivComponent))`
  position: absolute;
  right: 350px !important;
  top: 10px !important;
`;
