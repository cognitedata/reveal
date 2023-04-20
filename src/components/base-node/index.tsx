import {
  Colors,
  Detail,
  Elevations,
  Flex,
  Icon,
  IconType,
  Overline,
} from '@cognite/cogs.js';
import { Handle, Position } from 'reactflow';
import styled from 'styled-components';

const BASE_NODE_HANDLE_SIZE = 16;

type BaseNodeProps = {
  description?: string;
  icon: IconType;
  selected: boolean;
  title: string;
};

export const BaseNode = ({
  description,
  icon,
  selected,
  title,
}: BaseNodeProps): JSX.Element => {
  return (
    <StyledBaseNodeContainer
      className={selected ? 'workflow-builder-node-selected' : undefined}
    >
      <StyledBaseHandleLeft position={Position.Left} type="target" />
      <StyledBaseHandleRight position={Position.Right} type="source" />
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
  background-color: white;
  border: none;
  height: ${BASE_NODE_HANDLE_SIZE}px;
  width: ${BASE_NODE_HANDLE_SIZE / 2}px;
  right: ${(BASE_NODE_HANDLE_SIZE / 2) * -1}px;
  right: 0px;
  opacity: 0;
  z-index: 1;

  ::after {
    content: '';
    background-color: ${Colors['border--interactive--toggled-default']};
    border-radius: ${BASE_NODE_HANDLE_SIZE / 4}px;
    top: ${BASE_NODE_HANDLE_SIZE / 4}px;
    position: absolute;
    width: ${BASE_NODE_HANDLE_SIZE / 2}px;
    height: ${BASE_NODE_HANDLE_SIZE / 2}px;
  }

  :hover::after {
    background-color: ${Colors['border--interactive--toggled-hover']};
  }
`;

const StyledBaseHandleRight = styled(StyledBaseHandle)`
  border-radius: 2px 0 0 2px;
  right: 0px;

  ::after {
    left: ${BASE_NODE_HANDLE_SIZE / 4}px;
  }
`;

const StyledBaseHandleLeft = styled(StyledBaseHandle)`
  border-radius: 0 2px 2px 0;
  left: 0px;

  ::after {
    right: ${BASE_NODE_HANDLE_SIZE / 4}px;
  }
`;

const StyledBaseNodeContainer = styled.div`
  background-color: ${Colors['surface--muted']};
  border: 1px solid transparent;
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--interactive']};
  display: flex;
  flex-direction: column;
  width: 300px;

  :hover {
    outline: ${Colors['surface--interactive--toggled-default']} solid 4px;

    ${StyledBaseHandleRight}, ${StyledBaseHandleLeft} {
      opacity: 1;
    }
  }

  &.workflow-builder-node-selected {
    outline: ${Colors['surface--interactive--toggled-default']} solid 4px;
    border-color: ${Colors['border--interactive--toggled-default']};

    ${StyledBaseHandleRight}, ${StyledBaseHandleLeft} {
      opacity: 1;
    }
  }
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
