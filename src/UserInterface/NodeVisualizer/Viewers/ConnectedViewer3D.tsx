import { Dispatch } from "redux";
import { connect } from "react-redux";
import { State } from "@/UserInterface/Redux/State/State";
import { executeVisualizerToolbarCommand } from "@/UserInterface/Redux/reducers/VisualizersReducer";
import Viewer3D from "@/UserInterface/Components/Viewers/Viewer3D";
import ViewerUtils from "./ViewerUtils";
import { IToolbarButton } from "../ToolBar/VisualizerToolbar";

const mapStateToProps = (state: State) => {
  const toolbarCommands = ViewerUtils.getViewers()["3D"]?.getToolbarCommands();
  const toolbarGroupIds = toolbarCommands ? Object.keys(toolbarCommands) : [];

  const toolbarCommandStates = state.visualizers.viewers["3D"];
  const displayToolbar = new Map<string, IToolbarButton[]>();

  toolbarGroupIds.forEach((groupId) => {
    toolbarCommands[groupId].forEach((command, index) => {
      if (!displayToolbar[groupId]) displayToolbar[groupId] = [];
      displayToolbar[groupId].push({
        icon: command.getIcon(),
        isDropdown: command.isDropdown,
        tooltip: command.getTooltip(),
        dropdownOptions: command.dropdownOptions,
        // from state
        isChecked: toolbarCommandStates[groupId][index].isChecked,
        value: toolbarCommandStates[groupId][index].value,
        isVisible: toolbarCommandStates[groupId][index].isVisible,
      });
    });
  });
  return { toolbar: displayToolbar };
};

const mapDispatchToPros = (dispatch: Dispatch) => {
  return {
    onToolbarButtonClick: (
      visualizerId: string,
      groupId: string,
      index: number
    ) => {
      dispatch(executeVisualizerToolbarCommand(visualizerId, groupId, index));
    },
    onToolbarSelectionChange: (
      visualizerId: string,
      groupId: string,
      index: number,
      value: string
    ) => {
      dispatch(
        executeVisualizerToolbarCommand(visualizerId, groupId, index, value)
      );
    },
  };
};

export const ConnectedViewer3D = connect(
  mapStateToProps,
  mapDispatchToPros
)(Viewer3D);
