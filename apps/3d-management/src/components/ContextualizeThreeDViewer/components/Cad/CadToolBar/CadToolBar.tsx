import styled from 'styled-components';

import { FLOATING_ELEMENT_MARGIN } from '@3d-management/pages/ContextualizeEditor/constants';
import noop from 'lodash-es/noop';

import { ToolBar } from '@cognite/cogs.js';
import {
  RevealToolbar,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';

import { CadToolBarTools } from './CadToolBarTools';
type CadToolBarProps = {
  modelId: number;
  revisionId: number;
  onContextualizationDeleted: typeof noop;
};

export const CadToolBar = ({
  modelId,
  revisionId,
  onContextualizationDeleted,
}: CadToolBarProps) => {
  if (modelId === null) return;

  return (
    <>
      <StyledToolBar>
        <RevealToolbar.FitModelsButton />
        <CadToolBarTools
          modelId={modelId}
          revisionId={revisionId}
          onContextualizationDeleted={(mappedNodesDeleted) => {
            onContextualizationDeleted(mappedNodesDeleted);
          }}
        />
      </StyledToolBar>
    </>
  );
};

const StyledToolBar = styled(withSuppressRevealEvents(ToolBar))`
  position: absolute;
  left: ${FLOATING_ELEMENT_MARGIN}px;
  bottom: ${FLOATING_ELEMENT_MARGIN}px;
`;
