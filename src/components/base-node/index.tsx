import {
  Colors,
  Detail,
  Elevations,
  Flex,
  Icon,
  IconType,
  Overline,
} from '@cognite/cogs.js';
import { Handle, Position, useNodes } from 'reactflow';
import styled from 'styled-components';

import { CustomNodeData } from 'components/custom-node';
import { isConnectionValid } from 'utils';

const BASE_NODE_HANDLE_SIZE = 12;

type BaseNodeProps = {
  description?: string;
  icon: IconType;
  title: string;
};

export const BaseNode = ({
  description,
  icon,
  title,
}: BaseNodeProps): JSX.Element => {
  const nodes = useNodes<CustomNodeData>();

  return (
    <StyledBaseNodeContainer>
      <StyledBaseHandleLeft
        isValidConnection={(connection) => isConnectionValid(connection, nodes)}
        position={Position.Left}
        type="target"
      />
      <StyledBaseHandleRight
        isValidConnection={(connection) => isConnectionValid(connection, nodes)}
        position={Position.Right}
        type="source"
      />
      <StyledBaseNodeHeader>
        <Flex gap={8}>
          <StyledBaseNodeIconContainer>
            <StyledBaseNodeIcon type={icon} />
          </StyledBaseNodeIconContainer>
          <Flex direction="column" gap={2}>
            <StyledBaseNodeTitle level={3}>{title}</StyledBaseNodeTitle>
            {!!description && (
              <StyledBaseNodeDescription>
                {description}
              </StyledBaseNodeDescription>
            )}
          </Flex>
        </Flex>
      </StyledBaseNodeHeader>
    </StyledBaseNodeContainer>
  );
};

const StyledBaseHandle = styled(Handle)`
  background-color: ${Colors['border--interactive--toggled-default']};
  border: none;

  :hover {
    background-color: ${Colors['border--interactive--toggled-hover']};
  }

  :active {
    background-color: ${Colors['border--interactive--toggled-pressed']};
  }
`;

const StyledBaseNodeContainer = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--interactive']};
  display: flex;
  flex-direction: column;
  width: 300px;

  ${StyledBaseHandle}.react-flow__handle-left.react-flow__handle-connecting {
    background-color: ${Colors['surface--status-critical--strong--default']};
  }

  ${StyledBaseHandle}.react-flow__handle-left.react-flow__handle-valid {
    background-color: ${Colors['surface--status-success--strong--default']};
  }
`;

const StyledBaseHandleRight = styled(StyledBaseHandle)`
  border-radius: 50%;
  height: ${BASE_NODE_HANDLE_SIZE}px;
  width: ${BASE_NODE_HANDLE_SIZE}px;
  right: ${(BASE_NODE_HANDLE_SIZE / 2) * -1}px;
`;

const StyledBaseHandleLeft = styled(StyledBaseHandle)`
  border-radius: 2px;
  height: ${BASE_NODE_HANDLE_SIZE}px;
  width: ${BASE_NODE_HANDLE_SIZE / 2}px;
  left: ${(BASE_NODE_HANDLE_SIZE / 4) * -1}px;
`;

const StyledBaseNodeHeader = styled.div`
  padding: 8px;
`;

const StyledBaseNodeIconContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--interactive--toggled-default']};
  border-radius: 4px;
  display: flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const StyledBaseNodeIcon = styled(Icon)`
  color: ${Colors['text-icon--interactive--default']};
`;

const StyledBaseNodeTitle = styled(Overline)`
  color: ${Colors['text-icon--interactive--default']};
`;

const StyledBaseNodeDescription = styled(Detail)`
  color: ${Colors['text-icon--interactive--disabled']};
`;
