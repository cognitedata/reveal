import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { State } from 'UserInterface/Redux/State/State';
import { executeVisualizerToolbarCommand } from 'UserInterface/Redux/reducers/VisualizersReducer';
import { Viewer3D } from 'UserInterface/Components/Viewers/Viewer3D';
import { ViewerUtils } from 'UserInterface/NodeVisualizer/Viewers/ViewerUtils';
import { ToolbarConfig } from 'UserInterface/NodeVisualizer/ToolBar/VisualizerToolbar';

const mapStateToProps = (state: State) => {
  const toolbarCommands = ViewerUtils.getViewers()['3D']?.getToolbarCommands();

  const toolbarCommandStates = state.visualizers.viewers['3D'];
  const displayToolbar: ToolbarConfig = {};

  if (toolbarCommandStates) {
    Object.keys(toolbarCommands).forEach((groupId) => {
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
  }
  return { toolbarConfig: displayToolbar };
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
