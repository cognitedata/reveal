import { useEffect } from 'react';

import styled from 'styled-components';

import { useDatabases } from 'hooks/raw';
import { Flow } from 'types';

import { WorkflowBuilder } from '../flow-builder';

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
