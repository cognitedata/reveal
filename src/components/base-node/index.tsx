import { Colors } from '@cognite/cogs.js';
import { Handle, Position, useNodes } from 'react-flow-renderer';
import styled from 'styled-components';

import { CustomNodeData } from 'components/custom-node';
import { isConnectionValid } from 'utils';

const BASE_NODE_HANDLE_SIZE_IN_PX = 6;

type BaseNodeProps = {
  children: React.ReactNode;
};

export const BaseNode = ({ children }: BaseNodeProps): JSX.Element => {
  const nodes = useNodes<CustomNodeData>();

  return (
    <StyledBaseNodeContainer>
      <StyledBaseHandleLeft
        isValidConnection={(connection) => isConnectionValid(connection, nodes)}
        position={Position.Left}
        type="source"
      />
      <StyledBaseHandleRight
        isValidConnection={(connection) => isConnectionValid(connection, nodes)}
        position={Position.Right}
        type="target"
      />
      {children}
    </StyledBaseNodeContainer>
  );
};

const StyledBaseHandle = styled(Handle)`
  background-color: ${Colors['border--interactive--default']};
  border: none;
  border-radius: 0;
  height: 100%;
  width: ${BASE_NODE_HANDLE_SIZE_IN_PX}px;

  :hover {
    background-color: ${Colors['border--interactive--default--alt']};
  }
`;

const StyledBaseNodeContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--interactive--default']};
  border-right: none;
  border-left: none;
  display: flex;
  height: 80px;
  justify-content: center;
  width: 200px;

  ${StyledBaseHandle}.react-flow__handle-connecting {
    background-color: ${Colors['border--status-critical--strong']};
  }

  ${StyledBaseHandle}.react-flow__handle-valid {
    background-color: ${Colors['border--status-success--strong']};
  }
`;

const StyledBaseHandleRight = styled(StyledBaseHandle)`
  border-radius: 0 4px 4px 0;
  right: -${BASE_NODE_HANDLE_SIZE_IN_PX}px;
`;

const StyledBaseHandleLeft = styled(StyledBaseHandle)`
  left: -${BASE_NODE_HANDLE_SIZE_IN_PX}px;
  border-radius: 4px 0 0 4px;
`;
