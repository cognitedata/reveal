import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { Appearance } from '@/Core/States/Appearance';
import { Icon } from '@/UserInterface/Components/Icon/Icon';
import { ToolBarSelect } from '@/UserInterface/Components/ToolBarSelect/ToolBarSelect';
import { Icon as CogsIcon } from '@cognite/cogs.js';
import styled from 'styled-components';

export interface IToolbarButton {
  icon: string;
  isDropdown: boolean;
  tooltip: string;
  dropdownOptions: string[];

  // From State
  isChecked: boolean;
  value: string;
  isVisible: boolean;
}

export interface ToolbarConfig {
  [groupId: string]: IToolbarButton[];
}
export type ToolbarButtonClickHandler = (
  visualizerId: string,
  groupId: string,
  index: number
) => void;

export type ToolbarSelectChangeHandler = (
  visualizerId: string,
  groupId: string,
  index: number,
  value: string
) => void;

export interface VisualizerToolbarProps {
  /**
   * Visualizer instance id
   */
  visualizerId: string;
  /**
   * Toolbar configuration object
   */
  config?: ToolbarConfig;
  /**
   * Callback for toolbar click handling
   */
  onToolbarButtonClick: ToolbarButtonClickHandler;
  /**
   * Callback for toolbar selection changes
   */
  onToolbarSelectionChange: ToolbarSelectChangeHandler;
}

// Visualizer ToolBar Component
export const VisualizerToolbar = (props: VisualizerToolbarProps) => {
  const {
    config,
    visualizerId,
    onToolbarButtonClick,
    onToolbarSelectionChange,
  } = props;

  if (!config) return null;

  const groupIds: string[] = config ? Object.keys(config) : [];

  // Toolbar orientation
  const [horizontal, setHorizontal] = useState(true);

  // Whether dragging is happening
  const [dragging, setDragging] = useState(false);

  // Calls when handle is clicked
  const onToolbarHandleButtonClick = () => {
    setHorizontal(!horizontal);
  };

  // Called when dragging stops
  const onStop = () => {
    if (dragging) {
      setDragging(false);
    } else {
      onToolbarHandleButtonClick();
    }
  };

  // Called when dragging
  const onDrag = () => {
    if (!dragging) setDragging(true);
  };

  const addButton = (groupId, index, command) => {
    return (
      <ToolbarIcon
        size={Appearance.toolbarIconSize}
        selected={command.isChecked}
        onClick={() => onToolbarButtonClick(visualizerId, groupId, index)}
        key={`visualizer-toolbar-icon-${index}`}
      >
        {command.icon && (
          <Icon
            src={command.icon}
            tooltip={{
              text: command.tooltip,
              placement: horizontal ? 'bottom' : 'right-start',
            }}
            iconSize={{
              width: Appearance.toolbarIconSize,
              height: Appearance.toolbarIconSize,
            }}
          />
        )}
      </ToolbarIcon>
    );
  };

  const addDropdown = (groupId, index, command) => {
    return (
      <ToolBarSelect
        key={`toolbar-select-${index}`}
        currentValue={command.value}
        onChange={(value) =>
          onToolbarSelectionChange(visualizerId, groupId, index, value)
        }
        options={command.dropdownOptions}
        tooltip={{
          text: command.tooltip,
          placement: 'right-start',
        }}
        iconSize={{
          width: Appearance.toolbarSelectWidth,
          height: Appearance.toolbarIconSize,
        }}
      />
    );
  };

  const addToolbarButtons = (groupId: string) => {
    return config[groupId].map((command, index) => {
      if (command.isDropdown && command.isVisible) {
        return addDropdown(groupId, index, command);
      }
      if (!command.isDropdown && command.isVisible)
        return addButton(groupId, index, command);
      return null;
    });
  };

  const addToolbars = () => {
    return groupIds?.map((id) => {
      return (
        <ToolbarGroup horizontal={horizontal} key={`tool-group-${id}`}>
          {addToolbarButtons(id)}
        </ToolbarGroup>
      );
    });
  };

  return (
    <Draggable bounds="parent" handle=".handle" onDrag={onDrag} onStop={onStop}>
      <ToolbarWrapper>
        <ToolbarContainer horizontal={horizontal}>
          <DragHandle dragging={dragging}>
            <DragHandleIcon className="handle">
              <CogsIcon type="DragHandle" />
            </DragHandleIcon>
          </DragHandle>
          {addToolbars()}
        </ToolbarContainer>
      </ToolbarWrapper>
    </Draggable>
  );
};

interface IsHorizontalProps {
  horizontal?: boolean;
}
interface IsDruggingProps {
  dragging?: boolean;
}
interface ToolbarIconProps {
  size: number;
  selected?: boolean;
}

const ToolbarWrapper = styled.div`
  position: absolute;
  z-index: 10;
`;
const DragHandleIcon = styled.div`
  width: 1.2rem;
  height: 1.7rem;
`;
const ToolbarContainer = styled.div<IsHorizontalProps>`
  display: flex;
  position: relative;
  padding: 0 0 0 25px;
  flex-direction: ${({ horizontal }) => (horizontal ? 'row' : 'column')};
`;
const DragHandle = styled.div<IsDruggingProps>`
  position: absolute;
  left: 0.6rem;
  top: 0.5rem;
  cursor: ${({ dragging }) => (dragging ? 'move' : 'pointer')};
`;
const ToolbarGroup = styled.div<IsHorizontalProps>`
  display: inline-grid;
  grid-template-rows: ${({ horizontal }) =>
    horizontal ? 'auto auto' : 'auto'};
  grid-template-columns: ${({ horizontal }) =>
    horizontal ? 'auto auto' : 'auto'};
  grid-auto-flow: ${({ horizontal }) => (horizontal ? 'column' : 'row')};
  margin: 0.25rem;
  border: 0.01rem solid black;
  background-color: rgba(223, 223, 223, 0.6);
  border-radius: 0.2rem;
`;
const ToolbarIcon = styled.div<ToolbarIconProps>`
  height: ${({ size }) => size};
  width: ${({ size }) => size};
  transition: background-color 0.3s;
  margin: 0.025rem;
  padding: 0.2rem 0.2rem;
  cursor: pointer;
  background-color: ${({ selected }) =>
    selected ? 'lightblue' : 'transparent'};
  &:hover {
    background-color: lightblue;
    border-color: lightblue;
  }
`;
