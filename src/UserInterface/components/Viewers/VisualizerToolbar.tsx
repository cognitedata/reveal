import React, { useState } from "react";
import { useDispatch, connect } from "react-redux";
import Draggable from "react-draggable";
import InIcon from "@images/Actions/In.png";
import OutIcon from "@images/Actions/Out.png";

import { IToolbar } from "@/Core/Interfaces/IToolbar";
import { BaseCommand } from "@/Core/Commands/BaseCommand";
import Icon from "../Common/Icon";
import { executeToolBarCommand } from "@/UserInterface/redux/actions/visualizers";
import { ReduxStore } from "@/UserInterface/interfaces/common";
import { VisualizerStateInterface } from "@/UserInterface/interfaces/visualizers";

// No Of commands per line in Toolbar UI
const COMMANDS_PER_LINE = 18;

/**
 * Get dimension of the Toolbar UI
 * @param noOfCommands No of commands
 * @param isHorizontal Whether toolbar is horizontal or vertical
 */
const toolBarDimensions = (noOfCommands: number, isHorizontal: boolean) => {
  const numberOfRows = Math.ceil(noOfCommands / COMMANDS_PER_LINE);
  const [dimension1,
    dimension2] = [`${numberOfRows * 1.75}rem`,
    numberOfRows > 1 ? `${COMMANDS_PER_LINE * 1.75}rem` : `${noOfCommands * 1.75}rem`];
  if (isHorizontal) {
    return { width: dimension2, height: dimension1 }
  } else {
    return { width: dimension1, height: dimension2 }
  }
};

/**
 * Get margins of the Toolbar wrapper
 * @param noOfCommands No of commands
 * @param isHorizontal Whether toolbar is horizontal or vertical
 */
const toolBarWrapperMargins = (noOfCommands: number, isHorizontal: boolean) => {
  const numberOfRows = Math.ceil(noOfCommands / COMMANDS_PER_LINE);
  const [dimension1,
    dimension2] = [`${numberOfRows * 3}rem`,
    numberOfRows > 1 ? `${COMMANDS_PER_LINE * 1.9}rem` : `${noOfCommands * 1.9}rem`];
  if (isHorizontal) {
    return { marginBottom: dimension1, marginRight: dimension2 };
  } else {
    return { marginRight: dimension1, marginBottom: dimension2 };
  }
};

/**
 * Visualizer toolbar implementation
 * TODO: Place this class in seperate folder
 */
export class Toolbar implements IToolbar {
  // Array to store toolbar commands
  private commands: any[] = [];

  // Getter for commands
  get toolBarCommands(): any[] { return this.commands }

  //==================================================
  // OVERRIDES of IToolBar
  //==================================================

  /*override*/ add(command: BaseCommand): void { this.commands.push(command); }

  /*override*/ beginOptionMenu(): void { }

  /*override*/ addOptionMenu(command: BaseCommand): void { }

  /*override*/ endOptionMenu(): void { }
}

// Visualizer ToolBar Component
const VisualizerToolbar = (props: { visualizerId: string, visualizers: VisualizerStateInterface }) => {

  const { visualizerId, visualizers } = props;
  const toolBar = visualizers.toolBars[visualizerId];
  if (!toolBar) return null;

  const dispatch = useDispatch();

  // Toolbar orientation
  const [horizontal, setHorizontal] = useState(true);
  // Whether dragging is happening
  const [dragging, setDragging] = useState(false);

  // Calls when handle is clicked
  const onHandleClick = () => {
    setHorizontal(!horizontal);
  }
  // Called when dragging stops
  const onStop = () => {
    setDragging(false)
    if (!dragging) {
      onHandleClick()
    }
  }

  // Number of commands
  const noOfCommands = toolBar.length;

  // Render toolbar
  return <Draggable
    bounds="parent"
    handle=".handle"
    onDrag={() => setDragging(true)}
    onStop={onStop}>
    <div className="visualizer-toolbar-wrapper"
      style={{
        ...toolBarWrapperMargins(noOfCommands, horizontal)
      }}>
      <div className="visualizer-toolbar-container">
        <div className="handle" style={{
          cursor: dragging ? "move" : "pointer",
        }}>
          {horizontal ?
            <img src={InIcon} /> :
            <img src={OutIcon} />}
        </div>
        <div
          className="visuaizer-toolbar"
          style={{
            ...toolBarDimensions(noOfCommands, horizontal),
            flexDirection: horizontal ? "row" : "column",
            left: horizontal ? "0.3rem" : "-1rem",
            top: horizontal ? "0rem" : "1.2rem"
          }}>
          {toolBar.map((command, index) =>
            command.icon ? <div
              onClick={() => dispatch(executeToolBarCommand({
                visualizerId,
                index
              }))}
              key={`visualizer-toolbar-icon-${index}`}
              className={`visualizer-tool-bar-icon 
                        ${command.isChecked ?
                  "visualizer-tool-bar-icon-selected" : ""}`}>
              {command.icon && <Icon
                src={command.icon}
                tooltip={command.command.name}
                placement={horizontal ? "bottom" : "right-start"}
              />}
            </div> : null)}
        </div>
      </div>
    </div>
  </Draggable>
};

function mapStateToProps(state: ReduxStore) {
  return { visualizers: state.visualizers }
}

export default connect(mapStateToProps, {})(VisualizerToolbar);

