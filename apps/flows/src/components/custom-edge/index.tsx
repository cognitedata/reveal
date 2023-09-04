import { useState } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

import styled from 'styled-components';

import { FOREIGN_OBJECT_HEIGHT, FOREIGN_OBJECT_WIDTH } from '@flows/common';
import AddNodeButton from '@flows/components/edge-hover-buttons/AddNodeButton';
import DeleteEdgeButton from '@flows/components/edge-hover-buttons/DeleteEdgeButton';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';

import { Flex } from '@cognite/cogs.js';
export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  source,
  target,
}: EdgeProps): JSX.Element => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const [visibleAddButton, setVisibleAddButton] = useState<boolean>(false);
  const { changeEdges } = useWorkflowBuilderContext();

  const midpoint = {
    x: (sourceX + targetX) / 2 - FOREIGN_OBJECT_WIDTH / 2,
    y: (sourceY + targetY) / 2 - FOREIGN_OBJECT_HEIGHT / 2,
  };

  const deleteEdge = () => {
    changeEdges((edge) => {
      const i = edge.findIndex((e) => e.id === id);
      edge.deleteAt(i);
    });
  };

  return (
    <>
      <EdgeContainer $visibleAddButton={visibleAddButton}>
        <path
          id={id}
          style={{ ...style, stroke: 'transparent', strokeWidth: 10 }}
          className="react-flow__edge-path"
          d={edgePath}
        />
        <path
          id={id}
          style={{ ...style }}
          className="react-flow__edge-path"
          d={edgePath}
          markerEnd={markerEnd}
        />
        <foreignObject
          className="node"
          x={midpoint.x}
          y={midpoint.y}
          width={FOREIGN_OBJECT_WIDTH}
          height={FOREIGN_OBJECT_HEIGHT}
        >
          <Flex gap={10}>
            <AddNodeButton
              className="edge-button"
              xPos={midpoint.x}
              yPos={midpoint.y}
              id={id}
              source={source}
              target={target}
              visibleAddButton={visibleAddButton}
              setVisibleAddButton={setVisibleAddButton}
            />
            <DeleteEdgeButton className="edge-button" onDelete={deleteEdge} />
          </Flex>
        </foreignObject>
      </EdgeContainer>
    </>
  );
};

const EdgeContainer = styled.g<{ $visibleAddButton: boolean }>`
  .edge-button {
    visibility: ${({ $visibleAddButton }) =>
      $visibleAddButton ? 'visible' : 'hidden'};
  }

  :hover {
    .edge-button {
      visibility: visible;
    }
  }
`;
