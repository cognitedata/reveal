import { useEffect } from 'react';

import { Colors } from '@cognite/cogs.js';
import { Allotment } from 'allotment';
import { ReactFlowProvider } from 'react-flow-renderer';
import styled from 'styled-components';

import {
  CANVAS_SIDE_PANEL_MAX_SIZE,
  CANVAS_SIDE_PANEL_MIN_SIZE,
  CANVAS_SIDE_PANEL_PREFERRED_SIZE,
} from 'common';
import { CanvasSidePanel } from '../canvas-side-panel';
import { FlowBuilder } from '../flow-builder';
import { useDatabases } from 'hooks/raw';

import { Flow } from 'types';

type Props = {
  flow: Flow;
  onChange: (f: Flow) => void;
};

export const Canvas = ({ flow, onChange }: Props): JSX.Element => {
  const { canvas } = flow;
  const { nodes, edges } = canvas;

  const { fetchNextPage, isFetching, hasNextPage } = useDatabases();

  useEffect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, isFetching]);

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
            <FlowBuilder
              initialNodes={nodes}
              initialEdges={edges}
              onChange={({ nodes, edges }) =>
                onChange({ ...flow, canvas: { nodes, edges } })
              }
            />
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
