import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IVisualizerState } from "@/UserInterface/Redux/State/visualizer";
import { BaseCommand } from '@/Core/Commands/BaseCommand';
import Viewer from '@/UserInterface/Components/Viewers/Viewer';
import ViewerUtils from '@/UserInterface/NodeVisualizer/Viewers/ViewerUtils';

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
          const toolbar = viewer.getToolbarCommands();
          state.viewers[viewerName] = [];
          if (toolbar)
          {
            toolbar.forEach((item: BaseCommand) => 
            {
              state.viewers[viewerName].push(populateToolCommandState(item));
            });
          }
        }
      },
      prepare: (): { payload: { viewers: { [key: string]: Viewer } } } => 
      {
        return { payload: { viewers: ViewerUtils.getViewers() } };
      }
    },

    executeVisualizerToolbarCommand: {
      reducer: (state: IVisualizerState, action: PayloadAction<{ visualizerId: string, toolbarCommands: BaseCommand[] | null }>) => 
      {
        const { visualizerId, toolbarCommands } = action.payload;
        if (!toolbarCommands) return;

        toolbarCommands.forEach((toolCommand, index) => 
        {
          state.viewers[visualizerId][index] = populateToolCommandState(toolCommand);
        });
      },
      prepare: (visualizerId: string, index: number, value?: string): { payload: { visualizerId: string, toolbarCommands: BaseCommand[] | null } } => 
      {
        const toolbarCommands = ViewerUtils.getViewers()[visualizerId].getToolbarCommands();

        if (!toolbarCommands)
          return { payload: { visualizerId, toolbarCommands: null } };

        const toolCommand = toolbarCommands[index];

        if (value)
          toolCommand.invokeValue(value);
        else
          toolCommand.invoke();

        return { payload: { visualizerId, toolbarCommands } };
      }
    },

    updateVisualizerToolbars: {
      reducer: (state: IVisualizerState, action: PayloadAction <{ viewers: { [key: string]: Viewer } }>) => 
      {
        const { viewers } = action.payload;

        for (const [visualizerId, viewer] of Object.entries(viewers))
        {
          const toolbarCommands = viewer.getToolbarCommands();
          if (!toolbarCommands) continue;

          toolbarCommands.forEach((toolCommand, index) => 
          {
            state.viewers[visualizerId][index] = populateToolCommandState(toolCommand);
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
