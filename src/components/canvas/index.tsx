import { useEffect } from 'react';

import styled from 'styled-components';

import { CanvasSidePanel } from '../canvas-side-panel';
import { CanvasTopBar } from '../canvas-topbar/CanvasTopBar';
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
    <StyledCanvasContainer>
      <CanvasTopBar flow={flow} />
      <CanvasSidePanel />
      <FlowBuilder
        initialNodes={nodes}
        initialEdges={edges}
        onChange={({ nodes, edges }) =>
          onChange({ ...flow, canvas: { nodes, edges } })
        }
      />
    </StyledCanvasContainer>
  );
};

const StyledCanvasContainer = styled.div`
  height: 100%;
  width: 100%;
`;
