import styled from 'styled-components';

import { ToolBar } from '@cognite/cogs.js';
import {
  RevealToolbar,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { FLOATING_ELEMENT_MARGIN } from '../../../../../pages/ContextualizeEditor/constants';

import { CadToolBarTools } from './CadToolBarTools';

export const CadToolBar = () => {
  return (
    <>
      <StyledToolBar>
        <RevealToolbar.FitModelsButton />
        <CadToolBarTools />
      </StyledToolBar>
    </>
  );
};

const StyledToolBar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute;
  left: ${FLOATING_ELEMENT_MARGIN}px;
  bottom: ${FLOATING_ELEMENT_MARGIN}px;
`;
