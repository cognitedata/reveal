import React, { useState } from "react";
import Draggable from "react-draggable";
import { Appearance } from "@/Core/States/Appearance";
import InIcon from "@images/Actions/In.png";
import OutIcon from "@images/Actions/Out.png";
import Icon from "@/UserInterface/Components/Icon/Icon";
import ToolBarSelect from "@/UserInterface/Components/ToolBarSelect/ToolBarSelect";

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
/**
 * Get width and height of toolbar
 */
const toolBarDimensions = (
  dimension1: number,
  dimension2: number,
  isHorizontal: boolean
) => {
  if (isHorizontal) return { width: "fit-content", height: dimension1 };
  return { width: dimension1 * 2 };
};

/**
 * Get bottom and right margins of toolbar
 */

// Visualizer ToolBar Component
export default function VisualizerToolbar(props: {
  visualizerId: string;
  toolbar?: Map<string, IToolbarButton[]>;
  onToolbarButtonClick: (
    visualizerId: string,
    groupId: string,
    index: number
  ) => void;
  onToolbarSelectionChange: (
    visualizerId: string,
    groupId: string,
    index: number,
    value: string
  ) => void;
}) {
  const {
    toolbar,
    visualizerId,
    onToolbarButtonClick,
    onToolbarSelectionChange,
  } = props;
  if (!toolbar) return null;
  const groupIds: string[] = toolbar ? Object.keys(toolbar) : [];

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
    if (!dragging) {
      setDragging(true);
    }
  };

  let visibleNonDropdownCommands = [];

  let visibleDropdownCommands = [];

  groupIds?.map((groupId) => {
    visibleNonDropdownCommands = toolbar[groupId].filter(
      (command) => command.isVisible && !command.isDropdown
    );
    visibleDropdownCommands = toolbar[groupId].filter(
      (command) => command.isVisible && command.isDropdown
    );
  });

  // dropdown Items takes twice the size
  const noOfSlots =
    visibleNonDropdownCommands.length + visibleDropdownCommands.length * 2;
  // No Of commands per line in Toolbar UI
  const { toolbarCommandsPerLine } = Appearance;
  // Number of rows in toolbar
  const numberOfToolbarRows = Math.ceil(noOfSlots / toolbarCommandsPerLine);
  // Consider borders,margins and padding of img tag
  const iconSize = Appearance.toolbarIconSize + 7.2;
  const [dimension1, dimension2] = [
    numberOfToolbarRows * iconSize,
    numberOfToolbarRows > 1
      ? toolbarCommandsPerLine * iconSize
      : noOfSlots * iconSize,
  ];

  const addButton = (groupId, index, command) => {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToolbarButtonClick(visualizerId, groupId, index)}
        key={`visualizer-toolbar-icon-${index}`}
        className={`visualizer-tool-bar-icon ${
          command.isChecked ? "visualizer-tool-bar-icon-selected" : ""
        }`}
      >
        {command.icon && (
          <Icon
            src={command.icon}
            tooltip={{
              text: command.tooltip,
              placement: horizontal ? "bottom" : "right-start",
            }}
            iconSize={{
              width: Appearance.toolbarIconSize,
              height: Appearance.toolbarIconSize,
            }}
          />
        )}
      </div>
    );
  };

  const addDropdown = (groupId, index, command) => {
    return (
      <div
        key={`visualizer-toolbar-icon-${index}`}
        className="visualizer-tool-bar-icon"
      >
        <ToolBarSelect
          currentValue={command.value}
          onChange={(value) =>
            onToolbarSelectionChange(visualizerId, groupId, index, value)
          }
          options={command.dropdownOptions}
          tooltip={{
            text: command.tooltip,
            placement: horizontal ? "bottom" : "right-start",
          }}
          iconSize={{
            width: Appearance.toolbarSelectWidth,
            height: Appearance.toolbarIconSize,
          }}
        />
      </div>
    );
  };

  const addToolbarButtons = (groupId: string) => {
    return toolbar[groupId].map((command, index) => {
      if (command.isDropdown) {
        return addDropdown(groupId, index, command);
      }
      return addButton(groupId, index, command);
    });
  };

  const addToolbars = () => {
    return groupIds ? (
      groupIds.map((id) => {
        return (
          <div
            className="visualizer-toolbar-group"
            style={{
              ...toolBarDimensions(dimension1, dimension2, horizontal),
              left: horizontal ? "0.3rem" : "-1rem",
              top: horizontal ? "0rem" : "1.2rem",
            }}
            key={`tool-group-${id}`}
          >
            {addToolbarButtons(id)}
          </div>
        );
      })
    ) : (
      <div />
    );
  };

  // Render toolbar
  return (
    <Draggable bounds="parent" handle=".handle" onDrag={onDrag} onStop={onStop}>
      <div className="visualizer-toolbar-wrapper">
        <div
          className="visualizer-toolbar-container"
          style={{
            flexDirection: horizontal ? "row" : "column",
          }}
        >
          <div
            className="handle"
            style={{
              cursor: dragging ? "move" : "pointer",
            }}
          >
            <img src={horizontal ? InIcon : OutIcon} alt="Tool icon" />
          </div>
          {addToolbars()}
        </div>
      </div>
    </Draggable>
  );
}
