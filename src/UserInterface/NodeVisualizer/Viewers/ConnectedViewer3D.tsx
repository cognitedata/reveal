import { Dispatch } from "redux";
import { connect } from "react-redux";
import { State } from "@/UserInterface/Redux/State/State";
import { executeVisualizerToolbarCommand } from "@/UserInterface/Redux/reducers/VisualizersReducer";
import Viewer3D from "@/UserInterface/Components/Viewers/Viewer3D";
import ViewerUtils from "./ViewerUtils";
import { IToolbarButton } from "../ToolBar/VisualizerToolbar";

const mapStateToProps = (state: State) => {
  const toolbarCommands = ViewerUtils.getViewers()["3D"]?.getToolbarCommands();

  if (!toolbarCommands) return { toolbar: [] };

  const toolbarCommandStates = state.visualizers.viewers["3D"];
  const displayToolbar: IToolbarButton[] = [];

  toolbarCommands.forEach((cmd, index) => {
    displayToolbar.push({
      icon: cmd.getIcon(),
      isDropdown: cmd.isDropdown,
      tooltip: cmd.getTooltip(),
      dropdownOptions: cmd.dropdownOptions,
      // from state
      isChecked: toolbarCommandStates[index].isChecked,
      value: toolbarCommandStates[index].value,
      isVisible: toolbarCommandStates[index].isVisible,
    });
  });
  return { toolbar: displayToolbar };
};

const mapDispatchToPros = (dispatch: Dispatch) => {
  return {
    onToolbarButtonClick: (visualizerId: string, index: any) => {
      dispatch(executeVisualizerToolbarCommand(visualizerId, index));
    },
    onToolbarSelectionChange: (
      visualizerId: string,
      index: any,
      event: any
    ) => {
      dispatch(executeVisualizerToolbarCommand(visualizerId, index, event));
    },
  };
};

export const ConnectedViewer3D = connect(
  mapStateToProps,
  mapDispatchToPros
)(Viewer3D);
