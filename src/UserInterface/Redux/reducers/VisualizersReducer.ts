import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IVisualizerState } from "@/UserInterface/Redux/State/visualizer";
import { BaseCommand } from "@/Core/Commands/BaseCommand";
import Viewer from "@/UserInterface/Components/Viewers/Viewer";
import ViewerUtils from "@/UserInterface/NodeVisualizer/Viewers/ViewerUtils";
import { IToolbarGroups } from "@/Core/Interfaces/IToolbarGroups";

// Initial settings state
const initialState: IVisualizerState = {
  viewers: {},
  statusBar: {
    text: ""
  }
};

export const visualizerSlice = createSlice({
  name: "visualizer",
  initialState,
  reducers: {
    initializeToolbarStatus: {
      reducer:(state: IVisualizerState, action: PayloadAction<{ viewers: { [key: string]: Viewer } }>) =>
      {
        for (const viewer of Object.values(action.payload.viewers))
        {
          const viewerName = viewer.getName();
          const toolbarCommands = viewer.getToolbarCommands();
          const groupIds = Object.keys(toolbarCommands);
          state.viewers[viewerName] = {};

          groupIds?.forEach(groupId =>
          {
            toolbarCommands[groupId].forEach(command =>
            {
              if (!state.viewers[viewerName][groupId]) state.viewers[viewerName][groupId] = [];
              state.viewers[viewerName][groupId].push(populateToolCommandState(command));
            });
          });
        }
      },
      prepare: (): { payload: { viewers: { [key: string]: Viewer } } } =>
      {
        return { payload: { viewers: ViewerUtils.getViewers() } };
      }
    },

    executeVisualizerToolbarCommand: {
      reducer: (state: IVisualizerState, action: PayloadAction<{ visualizerId: string, toolbarCommands: IToolbarGroups | null }>) =>
      {
        const { visualizerId, toolbarCommands } = action.payload;
        const toolbar = state.viewers[visualizerId];
        if (!toolbarCommands) return;

        for (const [groupId, toolGroup] of Object.entries(toolbarCommands))
        {
          toolGroup.forEach((command, index) =>
          {
            toolbar[groupId][index] = populateToolCommandState(command);
          });
        }
      },
      prepare: (visualizerId: string, groupId: string, index: number, value?: string): { payload: { visualizerId: string, toolbarCommands: IToolbarGroups | null } } =>
      {
        const toolbarCommands = ViewerUtils.getViewers()[visualizerId].getToolbarCommands();

        if (!toolbarCommands)
          return { payload: { visualizerId, toolbarCommands: null } };

        const command = toolbarCommands[groupId][index];

        if (value)
          command.invokeValue(value);
        else
          command.invoke();

        return { payload: { visualizerId, toolbarCommands } };
      }
    },

    updateVisualizerToolbars: {
      reducer: (state: IVisualizerState, action: PayloadAction <{ viewers: { [key: string]: Viewer } }>) =>
      {
        const { viewers } = action.payload;

        for (const [visualizerId, viewer] of Object.entries(viewers))
        {
          const toolbar = state.viewers[visualizerId];
          const toolbarCommands = viewer.getToolbarCommands();
          const groupIds = Object.keys(toolbarCommands);
          if (!toolbarCommands) continue;

          groupIds?.forEach(groupId =>
          {
            toolbarCommands[groupId].forEach((command, index) =>
            {
              toolbar[groupId][index] = populateToolCommandState(command);
            });
          });
        }
      },
      prepare: (): { payload: { viewers: { [key: string]: Viewer } } } =>
      {
        return { payload: { viewers: ViewerUtils.getViewers() } };
      }
    },

    updateStatusPanel: (state: IVisualizerState, action: PayloadAction<{ text: string }>) =>
    {
      state.statusBar.text = action.payload.text;
    }
  },
});

function populateToolCommandState(item: BaseCommand)
{
  return {
    isChecked: item.isChecked,
    icon: item.getIcon(),
    isVisible: item.isVisible,
    isDropdown: item.isDropdown,
    value: item.value,
    tooltip: item.getTooltip(),
    dropdownOptions: item.dropdownOptions
  };
}

export default visualizerSlice.reducer;
export const { initializeToolbarStatus, executeVisualizerToolbarCommand, updateVisualizerToolbars, updateStatusPanel } = visualizerSlice.actions;
