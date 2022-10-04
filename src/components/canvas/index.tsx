import { Colors } from '@cognite/cogs.js';
import { Allotment } from 'allotment';
import styled from 'styled-components';

import {
  CANVAS_SIDE_PANEL_MAX_SIZE,
  CANVAS_SIDE_PANEL_MIN_SIZE,
  CANVAS_SIDE_PANEL_PREFERRED_SIZE,
} from 'common';
import { CanvasSidePanel } from '../canvas-side-panel';
import { FlowBuilder } from '../flow-builder';
import { ReactFlowProvider } from 'react-flow-renderer';

export const Canvas = (): JSX.Element => {
  return (
    <ReactFlowProvider>
      <StyledCanvasContainer>
        <Allotment>
          <Allotment.Pane
            maxSize={CANVAS_SIDE_PANEL_MAX_SIZE}
            minSize={CANVAS_SIDE_PANEL_MIN_SIZE}
            preferredSize={CANVAS_SIDE_PANEL_PREFERRED_SIZE}
          >
            <CanvasSidePanel />
          </Allotment.Pane>
          <Allotment.Pane>
            <FlowBuilder />
          </Allotment.Pane>
        </Allotment>
      </StyledCanvasContainer>
    </ReactFlowProvider>
  );
};

const StyledCanvasContainer = styled.div`
  height: 100%;
  width: 100%;

  --focus-border: ${Colors['border--interactive--hover']};
  --separator-border: ${Colors['border--muted']};
`;
