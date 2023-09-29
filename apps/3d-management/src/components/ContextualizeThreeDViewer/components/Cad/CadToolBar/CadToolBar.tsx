import styled from 'styled-components';

import { FLOATING_ELEMENT_MARGIN } from '@3d-management/pages/ContextualizeEditor/constants';

import { ToolBar } from '@cognite/cogs.js';
import {
  RevealToolbar,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { useContextualizeThreeDViewerStore } from '../../../useContextualizeThreeDViewerStore';

export const CadToolBar = () => {
  const { modelId } = useContextualizeThreeDViewerStore((state) => ({
    modelId: state.modelId,
  }));

  if (modelId === null) return null;

  return (
    <>
      <StyledToolBar>
        <RevealToolbar.FitModelsButton />
      </StyledToolBar>
    </>
  );
};

const StyledToolBar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute;
  left: ${FLOATING_ELEMENT_MARGIN}px;
  bottom: ${FLOATING_ELEMENT_MARGIN}px;
`;
