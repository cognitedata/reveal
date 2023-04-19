import { useState } from 'react';

import {
  Button,
  Colors,
  Detail,
  Dropdown,
  Elevations,
  Flex,
  Icon,
  IconType,
  Menu,
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
  const [isLeftDropdownVisible, setIsLeftDropdownVisible] = useState(false);
  const [isRightDropdownVisible, setIsRightDropdownVisible] = useState(false);

  return (
    <StyledBaseNodeContainer
      className={selected ? 'workflow-builder-node-selected' : undefined}
    >
      <StyledBaseNodeContent>
        <StyledBaseHandleLeft position={Position.Left} type="target" />
        <StyledBaseHandleRight position={Position.Right} type="source" />
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
      </StyledBaseNodeContent>
      <AddButtonLeftContainer
        className="nodrag"
        $isDropdownVisible={isLeftDropdownVisible}
      >
        <Dropdown
          content={
            <Menu>
              <Menu.Item icon="Code">Transformation</Menu.Item>
              <Menu.Item icon="FrameTool">Webhook</Menu.Item>
              <Menu.Item icon="Pipeline">Workflow</Menu.Item>
            </Menu>
          }
          onClickOutside={() => {
            setIsLeftDropdownVisible(false);
          }}
          placement="bottom-end"
          visible={isLeftDropdownVisible}
        >
          <Button
            onClick={() => setIsLeftDropdownVisible((prevState) => !prevState)}
            type="primary"
            icon="AddLarge"
            size="small"
          />
        </Dropdown>
      </AddButtonLeftContainer>
      <AddButtonRightContainer
        className="nodrag"
        $isDropdownVisible={isRightDropdownVisible}
      >
        <Dropdown
          content={
            <Menu>
              <Menu.Item icon="Code">Transformation</Menu.Item>
              <Menu.Item icon="FrameTool">Webhook</Menu.Item>
              <Menu.Item icon="Pipeline">Workflow</Menu.Item>
            </Menu>
          }
          onClickOutside={() => {
            setIsRightDropdownVisible(false);
          }}
          visible={isRightDropdownVisible}
        >
          <Button
            onClick={() => setIsRightDropdownVisible((prevState) => !prevState)}
            type="primary"
            icon="AddLarge"
            size="small"
          />
        </Dropdown>
      </AddButtonRightContainer>
    </StyledBaseNodeContainer>
  );
};

const AddButtonBase = styled.button<{ $isDropdownVisible?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  box-shadow: none;
  border: none;
  padding: 0;
  cursor: pointer;
  position: absolute;
  z-index: 5000;
  top: 13px;
  background-color: ${Colors['border--interactive--toggled-default']};
  color: ${Colors['text-icon--strong--inverted']};
  opacity: ${({ $isDropdownVisible }) => ($isDropdownVisible ? 1 : 0)};

  :hover {
    opacity: 1;
  }

  :active {
    background-color: ${Colors['border--interactive--toggled-hover']};
  }
`;

const AddButtonLeftContainer = styled(AddButtonBase)`
  left: -36px;
`;

const AddButtonRightContainer = styled(AddButtonBase)`
  right: -36px;
`;

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

const StyledBaseNodeContent = styled.div`
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 8px;

  :hover {
    outline: ${Colors['surface--interactive--toggled-default']} solid 4px;

    ${StyledBaseHandleRight}, ${StyledBaseHandleLeft} {
      opacity: 1;
    }
  }
`;

const StyledBaseNodeContainer = styled.div`
  background-color: ${Colors['surface--muted']};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--interactive']};
  display: flex;
  flex-direction: column;
  width: 300px;

  &.workflow-builder-node-selected {
    ${StyledBaseNodeContent} {
      outline: ${Colors['surface--interactive--toggled-default']} solid 4px;
      border-color: ${Colors['border--interactive--toggled-default']};
    }

    ${StyledBaseHandleRight}, ${StyledBaseHandleLeft} {
      opacity: 1;
    }
  }
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
