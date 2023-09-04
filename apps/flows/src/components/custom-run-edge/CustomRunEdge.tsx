import { EdgeProps, getBezierPath } from 'reactflow';

import styled from 'styled-components';

export const CustomRunEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps): JSX.Element => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  return (
    <>
      <EdgeContainer>
        <path
          id={id}
          style={{ ...style, stroke: 'transparent', strokeWidth: 10 }}
          className="react-flow__edge-path"
          d={edgePath}
        />
        <path
          id={id}
          style={{ ...style }}
          className="react-flow__edge-path custom-run-edge"
          d={edgePath}
          markerEnd={markerEnd}
        />
      </EdgeContainer>
    </>
  );
};

const EdgeContainer = styled.g``;
