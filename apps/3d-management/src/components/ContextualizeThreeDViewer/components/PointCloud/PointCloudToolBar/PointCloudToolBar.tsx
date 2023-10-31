import styled from 'styled-components';

import { ToolBar } from '@cognite/cogs.js';
import {
  RevealToolbar,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../../pages/ContextualizeEditor/constants';

import { AddAnnotationToolBar } from './AddAnnotationToolBar';
import {
  AddAnnotationButton,
  SelectToolButton,
  SettingsButton,
  SlicerButton,
  ToggleWireframeVisibilityButton,
} from './buttons';

export const PointCloudToolBar = () => {
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
