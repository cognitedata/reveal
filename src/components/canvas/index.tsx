import { useEffect } from 'react';

import styled from 'styled-components';

import { CanvasSidePanel } from '../canvas-side-panel';
import { CanvasTopBar } from '../canvas-topbar/CanvasTopBar';
import { WorkflowBuilder } from '../flow-builder';
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
    <CanvasContainer>
      <CanvasTopBar flow={flow} />
      <CanvasSidePanel />
      <WorkflowBuilder
        initialNodes={nodes}
        initialEdges={edges}
        onChange={({ nodes, edges }) =>
          onChange({ ...flow, canvas: { nodes, edges } })
        }
      />
    </CanvasContainer>
  );
};

const CanvasContainer = styled.div`
  height: 100%;
  width: 100%;
`;
