import React, { useState, useEffect } from "react";
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

  // Command types
  const commandTypes = Object.keys(toolBar);

  // Render toolbar
  return <Draggable
    bounds="parent"
    handle=".handle"
    onDrag={() => setDragging(true)}
    onStop={onStop}>
    <div className="visualizer-toolbar-wrapper"
      style={{
        marginRight: horizontal ? "22rem" : "3rem",
        marginBottom: horizontal ? "3rem" : "20rem",
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
            flexDirection: horizontal ? "row" : "column",
            left: horizontal ? "0.3rem" : "-1rem",
            top: horizontal ? "0rem" : "1.2rem"
          }}>
          {commandTypes.map((commandType: string, index) =>
            <div
              key={`toolbar-${commandType}-${index}`}
              className="visuaizer-toolbar-group"
              style={{ flexDirection: horizontal ? "row" : "column" }}
            >
              {toolBar[commandType].map((command, commandIndex) => command.icon ? <div
                onClick={() => dispatch(executeToolBarCommand({
                  visualizerId,
                  commandType,
                  index: commandIndex
                }))}
                key={`visualizer-toolbar-icon-${commandType}${commandIndex}`}
                className={`visualizer-tool-bar-icon 
                        ${command.isChecked ?
                    "visualizer-tool-bar-icon-selected" : ""}`}>
                {command.icon && <Icon
                  src={command.icon}
                  tooltip={command.command.name}
                  placement={horizontal ? "bottom" : "right-start"}
                />}
              </div> : null)}
            </div>)}
        </div>
      </div>
    </div>
  </Draggable>

};

function mapStateToProps(state: ReduxStore) {
  return { visualizers: state.visualizers }
}

export default connect(mapStateToProps, {})(VisualizerToolbar);

