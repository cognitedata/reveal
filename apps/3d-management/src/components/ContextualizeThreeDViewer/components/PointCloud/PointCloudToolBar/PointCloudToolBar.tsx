import { useEffect } from 'react';

import styled from 'styled-components';

import { ToolBar } from '@cognite/cogs.js';
import {
  RevealToolbar,
  useReveal,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../../pages/ContextualizeEditor/constants';
import {
  setThreeDViewer,
  useContextualizeThreeDViewerStore,
} from '../../../useContextualizeThreeDViewerStore';

import { AddAnnotationToolBar } from './AddAnnotationToolBar';
import {
  AddAnnotationButton,
  SelectToolButton,
  SettingsButton,
  SlicerButton,
  ToggleWireframeVisibilityButton,
} from './buttons';

export const PointCloudToolBar = () => {
  const { modelId } = useContextualizeThreeDViewerStore((state) => ({
    modelId: state.modelId,
  }));

  const viewer = useReveal();

  // NOTE: This isn't the cleanest place to put this (it feels quite arbitrary that it is in the ToolBar file), but it's fine for now.
  //       The problem here is that the RevealContainer provider is added in the ContextualizeThreeDViewer component, which is a parent of this component.
  //       The most logical place to put the following useEffect would be in the ContextualizeThreeDViewer component, but we don't have access to the viewer there.
  useEffect(() => {
    setThreeDViewer(viewer);
  }, [viewer]);

  if (modelId === null) return null;

  return (
    <>
      <StyledToolBar>
        <>
          <RevealToolbar.FitModelsButton />
        </>
        <>
          <SlicerButton />
          <ToggleWireframeVisibilityButton />
        </>
        <>
          <SelectToolButton />
          <AddAnnotationButton />
        </>
        <>
          <SettingsButton />
        </>
      </StyledToolBar>

      <AddAnnotationToolBar />
    </>
  );
};

const StyledToolBar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute;
  left: ${FLOATING_ELEMENT_MARGIN}px;
  bottom: ${FLOATING_ELEMENT_MARGIN}px;
`;

export const StyledInformation = styled.div<{ left: number; bottom: number }>`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 10px;
  left: ${(props) => props.left}px;
  bottom: ${(props) => props.bottom}px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.5;
  max-width: 200px;
  color: white;
  pointer-events: none;
`;
